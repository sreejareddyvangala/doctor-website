/**
 * Overpass QL queries for one city. Two queries per city, cached for days:
 * the named localities that become areas, and the mapped places that are
 * counted (never displayed) to measure competition and activity.
 *
 * Filters use exact tag values wherever the key is common (`building`,
 * `amenity`, `leisure`): Overpass answers those from its index, whereas a
 * regular expression makes it scan every element carrying the key.
 */

import { UpstreamError } from '../../errors.ts';
import type { PoliteHttp } from './http.ts';
import type { OverpassElement, ResolvedCity } from './types.ts';

export interface OverpassOptions {
  url: string;
  /** Client-side abort. Defaults to 130 s, a little above the server-side timeout. */
  timeoutMs?: number;
}

/** How the city is expressed spatially inside a query. */
export interface SpatialScope {
  /** Statement that binds the `.city` set, or empty when a plain filter is used. */
  prelude: string;
  /** Filter appended to each `nwr[...]` statement. */
  filter: string;
  kind: 'area' | 'bbox' | 'around';
}

const RELATION_AREA_OFFSET = 3_600_000_000;
const WAY_AREA_OFFSET = 2_400_000_000;

/** Prefer the administrative area; a bare place node only gives us a radius. */
export function areaScope(city: ResolvedCity, fallbackRadiusM: number): SpatialScope {
  if (city.osmType === 'relation') {
    return {
      prelude: `area(${RELATION_AREA_OFFSET + city.osmId})->.city;`,
      filter: '(area.city)',
      kind: 'area',
    };
  }
  if (city.osmType === 'way') {
    return {
      prelude: `area(${WAY_AREA_OFFSET + city.osmId})->.city;`,
      filter: '(area.city)',
      kind: 'area',
    };
  }
  return aroundScope(city, fallbackRadiusM);
}

/** A circle around the city centre, for cities known only as a point or with an oversized bbox. */
export function aroundScope(city: ResolvedCity, radiusM: number): SpatialScope {
  return {
    prelude: '',
    filter: `(around:${radiusM},${city.lat},${city.lon})`,
    kind: 'around',
  };
}

/** Bounding-box scope, used when Overpass has no area for the relation. */
export function bboxScope(city: ResolvedCity): SpatialScope {
  const { south, west, north, east } = city.bbox;
  return { prelude: '', filter: `(${south},${west},${north},${east})`, kind: 'bbox' };
}

const LOCALITY_PLACE_TYPES = ['suburb', 'quarter', 'neighbourhood'];

export function buildLocalitiesQuery(scope: SpatialScope, timeoutSeconds: number): string {
  return [
    `[out:json][timeout:${timeoutSeconds}];`,
    scope.prelude,
    '(',
    ...LOCALITY_PLACE_TYPES.map((type) => `  nwr["place"="${type}"]["name"]${scope.filter};`),
    ');',
    'out tags center qt;',
  ].join('\n');
}

/** Amenity values worth counting. Kept narrow so the payload stays small. */
const AMENITIES = [
  // Food & beverage
  'restaurant',
  'cafe',
  'fast_food',
  'food_court',
  'ice_cream',
  'bar',
  'pub',
  'juice_bar',
  // Education
  'school',
  'college',
  'university',
  'kindergarten',
  'language_school',
  'music_school',
  'training',
  'prep_school',
  'dormitory',
  // Healthcare
  'hospital',
  'clinic',
  'doctors',
  'dentist',
  'pharmacy',
  // Fitness, beauty, services, transit
  'gym',
  'spa',
  'coworking_space',
  'veterinary',
  'animal_boarding',
  'bus_station',
];

const LEISURE = ['fitness_centre', 'sports_centre', 'playground'];
const SPORTS = ['yoga', 'fitness', 'pilates'];
const BUILDINGS = ['office', 'dormitory'];

export function buildPoisQuery(scope: SpatialScope, timeoutSeconds: number): string {
  const f = scope.filter;
  return [
    `[out:json][timeout:${timeoutSeconds}];`,
    scope.prelude,
    '(',
    `  nwr["shop"]${f};`,
    `  nwr["healthcare"]${f};`,
    `  nwr["office"]${f};`,
    `  nwr["railway"="station"]${f};`,
    `  nwr["public_transport"="station"]${f};`,
    ...AMENITIES.map((value) => `  nwr["amenity"="${value}"]${f};`),
    ...LEISURE.map((value) => `  nwr["leisure"="${value}"]${f};`),
    ...SPORTS.map((value) => `  nwr["sport"="${value}"]${f};`),
    ...BUILDINGS.map((value) => `  nwr["building"="${value}"]${f};`),
    ');',
    'out tags center qt;',
  ].join('\n');
}

interface OverpassResponse {
  elements?: OverpassElement[];
  /** Overpass reports query-level problems (timeouts, memory) here with HTTP 200. */
  remark?: string;
}

export async function runOverpass(
  http: PoliteHttp,
  options: OverpassOptions,
  query: string,
): Promise<OverpassElement[]> {
  const data = await http.requestJson<OverpassResponse>('OpenStreetMap Overpass', options.url, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    timeoutMs: options.timeoutMs ?? 130_000,
    // A second full attempt is already expensive for everyone involved.
    maxRetries: 1,
  });

  if (data.remark && /error|timed out|out of memory|too busy/i.test(data.remark)) {
    throw new UpstreamError(
      'OpenStreetMap Overpass',
      `Overpass could not complete the query: ${data.remark.trim()}`,
      { retryable: true },
    );
  }

  return Array.isArray(data.elements) ? data.elements : [];
}
