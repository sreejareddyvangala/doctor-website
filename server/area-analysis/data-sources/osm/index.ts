/**
 * OpenStreetMap-backed `AreaDataSource`.
 *
 * For a city the cache has not seen:
 *   1. Nominatim resolves the typed name to the city's boundary.        (1 request)
 *   2. Overpass lists the named localities inside it.                   (1 request)
 *   3. Overpass returns the mapped businesses, offices and stations.    (1 request)
 *   4. Places are counted inside each locality's catchment. The raw
 *      counts are cached; indices are derived on every read, so scaling
 *      can be tuned without another download.
 *
 * Cache entries are keyed by the resolved city (`relation-12345`), with the
 * typed name stored as an alias. "hyd", "Hyderabad" and "hyderabad city"
 * therefore share one download; an alias only costs a Nominatim lookup the
 * first time it is seen. Individual places are never exposed to the UI.
 *
 * Queries are bounded by the city's bounding box by default. The exact
 * administrative boundary (`scope: 'area'`) is available, but the public
 * Overpass instance answers area-filtered queries roughly thirty times
 * slower (about 90 s versus 3 s for Hyderabad's localities).
 *
 * Signals OpenStreetMap cannot provide (population, affluence, growth) are
 * left undefined for other sources.
 */

import type {
  DataSourceInfo,
  SignalCoverage,
} from '../../../../shared/area-analysis/contracts.ts';
import type { Logger } from '../../../logger.ts';
import { normalizeCityName } from '../../utils/normalize-city.ts';
import type { AreaDataSource, CityAreas } from '../types.ts';
import { computeLocalityMetrics, deriveAreas, extractLocalities, toPoiPoints } from './aggregate.ts';
import { createJsonCache } from './cache.ts';
import { createPoliteHttp } from './http.ts';
import { resolveCity } from './nominatim.ts';
import { haversineKm } from './geo.ts';
import {
  areaScope,
  aroundScope,
  bboxScope,
  buildLocalitiesQuery,
  buildPoisQuery,
  runOverpass,
  type SpatialScope,
} from './overpass.ts';
import type { LocalityMetrics, ResolvedCity } from './types.ts';

export interface OsmAreaDataSourceOptions {
  overpassUrl: string;
  nominatimUrl: string;
  /** Identifies this deployment to the OSM services, as their policies require. */
  userAgent: string;
  /** ISO country codes that bias city lookups. Empty means worldwide. */
  countryCodes: string[];
  /** Bounding box (fast, default) or exact administrative boundary (slow). */
  scope?: 'bbox' | 'area';
  /** Directory for the on-disk cache. Omit for memory only (tests). */
  cacheDir?: string;
  cacheTtlMs: number;
  /** Catchment radius around each locality centre, in metres. */
  catchmentRadiusM: number;
  maxAreas: number;
  minPois: number;
  /** Offered as suggestions before any city has been analysed. */
  suggestedCities: string[];
  fetch?: typeof fetch;
  logger?: Logger;
  /** Test hooks for the polite HTTP client. */
  minIntervalMs?: number;
  retryDelaysMs?: number[];
  rateLimitDelaysMs?: number[];
}

/**
 * Shorthand people type for cities. Nominatim matches "hyd" to Holyhead in
 * Wales, which is not what anyone in India means, so the common
 * abbreviations are expanded before the lookup. Purely a query aid: the
 * data still comes from OpenStreetMap.
 */
const CITY_ABBREVIATIONS: Record<string, string> = {
  hyd: 'Hyderabad',
  blr: 'Bengaluru',
  bom: 'Mumbai',
};

/** Bump when the cached shape changes; older entries are then ignored. */
const CACHE_VERSION = 2;
/** Unknown city names are remembered for a day so typos do not hammer Nominatim. */
const NOT_FOUND_TTL_MS = 24 * 60 * 60 * 1000;
/** Search radius when Nominatim only knows the city as a point, or its bbox is oversized. */
const NODE_FALLBACK_RADIUS_M = 12_000;
/** A bounding box wider or taller than this is a district, not a city; query a radius instead. */
const MAX_BBOX_SPAN_KM = 60;
const OVERPASS_QUERY_TIMEOUT_S = 120;
const MAX_SUGGESTED_CITIES = 8;

interface CachedCityData {
  kind: 'city';
  version: number;
  city: ResolvedCity;
  /** Raw counts per locality; indices are derived on read. */
  localities: LocalityMetrics[];
  poisUsed: number;
  fetchedAt: string;
}

interface CachedAlias {
  kind: 'alias';
  version: number;
  cityKey: string;
}

interface CachedMiss {
  kind: 'not_found';
  version: number;
  query: string;
}

type CacheEntry = CachedCityData | CachedAlias | CachedMiss;

export const OSM_DATA_SOURCE_INFO: DataSourceInfo = {
  id: 'osm',
  label: 'OpenStreetMap',
  isSample: false,
  attribution: 'Map data © OpenStreetMap contributors (ODbL)',
  attributionUrl: 'https://www.openstreetmap.org/copyright',
  acceptsAnyCity: true,
  missingCityHint:
    'OpenStreetMap has no city, town or district by that name. Check the spelling or try a larger nearby city.',
};

/** What this source can and cannot say about an area, for the UI to label. */
export function osmCoverage(catchmentRadiusM: number): SignalCoverage[] {
  const radius = describeRadius(catchmentRadiusM);
  return [
    {
      signal: 'competition',
      provenance: 'measured',
      source: 'OpenStreetMap',
      method: `Mapped businesses per category within ${radius} of each locality centre, ranked within the city`,
    },
    {
      signal: 'footfall',
      provenance: 'proxy',
      source: 'OpenStreetMap',
      method: 'Density of mapped shops, eateries and other businesses, plus rail and bus stations',
    },
    {
      signal: 'youngProfessionals',
      provenance: 'proxy',
      source: 'OpenStreetMap',
      method: 'Density of mapped offices and co-working spaces',
    },
    {
      signal: 'families',
      provenance: 'proxy',
      source: 'OpenStreetMap',
      method: 'Density of mapped schools, kindergartens and playgrounds',
    },
    {
      signal: 'students',
      provenance: 'proxy',
      source: 'OpenStreetMap',
      method: 'Density of mapped colleges, universities and hostels',
    },
    {
      signal: 'population',
      provenance: 'unavailable',
      source: 'Not connected',
      method: 'Needs a population dataset such as WorldPop',
    },
    {
      signal: 'affluence',
      provenance: 'unavailable',
      source: 'Not connected',
      method: 'Needs a wealth or rent index',
    },
    {
      signal: 'growth',
      provenance: 'unavailable',
      source: 'Not connected',
      method: 'Needs construction or RERA registration data',
    },
  ];
}

export function createOsmAreaDataSource(options: OsmAreaDataSourceOptions): AreaDataSource {
  const { logger } = options;
  const http = createPoliteHttp({
    userAgent: options.userAgent,
    fetch: options.fetch,
    minIntervalMs: options.minIntervalMs,
    retryDelaysMs: options.retryDelaysMs,
    rateLimitDelaysMs: options.rateLimitDelaysMs,
    logger,
  });
  const cache = createJsonCache({ dir: options.cacheDir, logger });
  const inFlight = new Map<string, Promise<CityAreas | null>>();
  const overpass = { url: options.overpassUrl };
  const nominatim = { baseUrl: options.nominatimUrl, countryCodes: options.countryCodes };
  const coverage = osmCoverage(options.catchmentRadiusM);
  const radiusText = describeRadius(options.catchmentRadiusM);

  async function lookup(key: string, query: string): Promise<CityAreas | null> {
    const entry = await cache.get<CacheEntry>(key);
    if (entry?.version === CACHE_VERSION) {
      if (entry.kind === 'not_found') return null;
      if (entry.kind === 'alias') {
        const cityEntry = await cache.get<CacheEntry>(entry.cityKey);
        if (isCityEntry(cityEntry)) return derive(cityEntry);
      }
    }

    const started = Date.now();
    const searchText = CITY_ABBREVIATIONS[key] ?? query;
    const city = await resolveCity(http, nominatim, searchText);
    if (!city) {
      logger?.info(`[osm] "${query}" is not a known city (Nominatim, ${elapsed(started)})`);
      const miss: CachedMiss = { kind: 'not_found', version: CACHE_VERSION, query };
      await cache.set(key, miss, NOT_FOUND_TTL_MS);
      return null;
    }
    logger?.info(
      `[osm] "${query}" resolved to ${city.name} (${city.osmType} ${city.osmId}) in ${elapsed(started)}`,
    );

    const cityKey = `${city.osmType}-${city.osmId}`;
    const existing = await cache.get<CacheEntry>(cityKey);
    if (isCityEntry(existing)) {
      await rememberAlias(key, city, cityKey);
      return derive(existing);
    }

    const built = await buildCity(city);
    await cache.set(cityKey, built, options.cacheTtlMs);
    await rememberAlias(key, city, cityKey);
    return derive(built);
  }

  async function rememberAlias(key: string, city: ResolvedCity, cityKey: string): Promise<void> {
    const alias: CachedAlias = { kind: 'alias', version: CACHE_VERSION, cityKey };
    await cache.set(key, alias, options.cacheTtlMs);
    const canonical = normalizeCityName(city.name);
    if (canonical && canonical !== key) await cache.set(canonical, alias, options.cacheTtlMs);
  }

  function scopeFor(city: ResolvedCity): SpatialScope {
    if (options.scope === 'area') return areaScope(city, NODE_FALLBACK_RADIUS_M);
    if (city.osmType === 'node') return aroundScope(city, NODE_FALLBACK_RADIUS_M);

    const { south, west, north, east } = city.bbox;
    const spanKm = Math.max(
      haversineKm(south, west, north, west),
      haversineKm(south, west, south, east),
    );
    if (spanKm > MAX_BBOX_SPAN_KM) {
      logger?.warn(
        `[osm] ${city.name}: bounding box spans ${spanKm.toFixed(0)} km, more than a city; using a ${NODE_FALLBACK_RADIUS_M / 1000} km radius around its centre instead.`,
      );
      return aroundScope(city, NODE_FALLBACK_RADIUS_M);
    }
    return bboxScope(city);
  }

  async function buildCity(city: ResolvedCity): Promise<CachedCityData> {
    let scope: SpatialScope = scopeFor(city);
    let started = Date.now();
    let localityElements = await runOverpass(
      http,
      overpass,
      buildLocalitiesQuery(scope, OVERPASS_QUERY_TIMEOUT_S),
    );
    logger?.info(
      `[osm] ${city.name}: Overpass returned ${localityElements.length} place elements in ${elapsed(started)}`,
    );

    if (localityElements.length === 0 && scope.kind === 'area') {
      // Overpass has no area object for some boundaries; the bounding box is the next best thing.
      scope = bboxScope(city);
      started = Date.now();
      localityElements = await runOverpass(
        http,
        overpass,
        buildLocalitiesQuery(scope, OVERPASS_QUERY_TIMEOUT_S),
      );
      logger?.info(
        `[osm] ${city.name}: bounding-box fallback returned ${localityElements.length} place elements in ${elapsed(started)}`,
      );
    }

    const localities = extractLocalities(localityElements);
    const base = { kind: 'city' as const, version: CACHE_VERSION, city, fetchedAt: new Date().toISOString() };
    if (localities.length === 0) {
      return { ...base, localities: [], poisUsed: 0 };
    }

    started = Date.now();
    const poiElements = await runOverpass(
      http,
      overpass,
      buildPoisQuery(scope, OVERPASS_QUERY_TIMEOUT_S),
    );
    logger?.info(
      `[osm] ${city.name}: Overpass returned ${poiElements.length} place-of-interest elements in ${elapsed(started)}`,
    );

    const { metrics, poisUsed } = computeLocalityMetrics(
      localities,
      toPoiPoints(poiElements),
      options.catchmentRadiusM / 1000,
    );
    logger?.info(
      `[osm] ${city.name}: ${localities.length} localities, ${poisUsed} mapped places inside catchments`,
    );
    return { ...base, localities: metrics, poisUsed };
  }

  function derive(entry: CachedCityData): CityAreas {
    const cityName = entry.city.name;
    if (entry.localities.length === 0) {
      return {
        city: cityName,
        areas: [],
        coverage,
        notes: [
          `OpenStreetMap has no named localities (suburbs or neighbourhoods) mapped inside ${cityName}, so there is nothing to rank yet.`,
        ],
        skippedAreas: 0,
      };
    }

    const { areas, skippedLowData, skippedByCap } = deriveAreas(cityName, entry.localities, {
      minPois: options.minPois,
      maxAreas: options.maxAreas,
    });

    const notes = [
      `Counted ${entry.poisUsed} mapped places across ${entry.localities.length} localities in OpenStreetMap, each measured within ${radiusText} of its centre. Indices are ranks within the city.`,
    ];
    if (skippedLowData > 0) {
      notes.push(
        `${skippedLowData} ${skippedLowData === 1 ? 'locality was' : 'localities were'} left out because fewer than ${options.minPois} businesses are mapped nearby.`,
      );
    }
    if (skippedByCap > 0) {
      notes.push(`Showing the ${areas.length} localities with the most mapped businesses.`);
    }
    if (areas.length === 0) {
      notes.push('No locality has enough mapped businesses to score.');
    }

    return { city: cityName, areas, coverage, notes, skippedAreas: skippedLowData + skippedByCap };
  }

  return {
    info: OSM_DATA_SOURCE_INFO,

    async listCities() {
      const analysed = (await cache.values<CacheEntry>())
        .filter((entry): entry is CachedCityData => isCityEntry(entry) && entry.localities.length > 0)
        .map((entry) => entry.city.name);

      const seen = new Set<string>();
      const cities: string[] = [];
      for (const name of [...options.suggestedCities, ...analysed]) {
        const key = normalizeCityName(name);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        cities.push(name);
      }
      return cities.slice(0, MAX_SUGGESTED_CITIES);
    },

    getCityAreas(cityQuery: string) {
      const key = normalizeCityName(cityQuery);
      if (!key) return Promise.resolve(null);

      // Concurrent requests for the same city share one upstream fetch.
      const running = inFlight.get(key);
      if (running) return running;

      const task = lookup(key, cityQuery.trim()).finally(() => inFlight.delete(key));
      inFlight.set(key, task);
      return task;
    },
  };
}

function isCityEntry(entry: unknown): entry is CachedCityData {
  if (typeof entry !== 'object' || entry === null) return false;
  const candidate = entry as Partial<CachedCityData>;
  return (
    candidate.kind === 'city' &&
    candidate.version === CACHE_VERSION &&
    Array.isArray(candidate.localities) &&
    typeof candidate.city === 'object' &&
    candidate.city !== null
  );
}

function elapsed(startedAt: number): string {
  return `${((Date.now() - startedAt) / 1000).toFixed(1)} s`;
}

function describeRadius(metres: number): string {
  if (metres < 1000) return `${metres} m`;
  const km = metres / 1000;
  return `${Number.isInteger(km) ? km : km.toFixed(1)} km`;
}
