/**
 * Turns raw Overpass elements into `AreaSignals` in two stages:
 *
 *   1. `computeLocalityMetrics` counts mapped places inside each locality's
 *      catchment. These raw counts are what the source caches.
 *   2. `deriveAreas` scales the counts to the 0-100 city-relative indices
 *      the engine expects, so scaling can change without refetching.
 *
 * Only what OpenStreetMap can support is produced. Population, affluence and
 * growth are left undefined for other sources to supply.
 */

import { normalizeCityName } from '../../utils/normalize-city.ts';
import { COMPETITION_KEYS, type AreaSignals, type CompetitionKey } from '../types.ts';
import { classifyPoi } from './classify.ts';
import { bearingDegrees, compassSector, haversineKm, slugify } from './geo.ts';
import type { Locality, LocalityMetrics, OverpassElement, PoiPoint } from './types.ts';

/** Suburbs and quarters are the right granularity; neighbourhoods only fill in when there are few. */
const PREFERRED_PLACE_TYPES = new Set(['suburb', 'quarter']);
const MIN_PREFERRED_LOCALITIES = 8;

/** Localities closer than this to the city's activity centre are called "Central". */
const CENTRAL_RADIUS_KM = 3;

export function extractLocalities(elements: OverpassElement[]): Locality[] {
  const candidates = elements
    .map(toLocalityCandidate)
    .filter((l): l is LocalityCandidate => l !== null);
  const preferred = candidates.filter((l) => PREFERRED_PLACE_TYPES.has(l.placeType));
  const pool = preferred.length >= MIN_PREFERRED_LOCALITIES ? preferred : candidates;

  // The same locality is often mapped twice (a place node and a boundary).
  // Keep one per name, preferring nodes, which sit at the perceived centre.
  const ordered = [...pool].sort((a, b) => Number(b.isNode) - Number(a.isNode));
  const seen = new Set<string>();
  const localities: Locality[] = [];
  for (const { isNode: _isNode, ...candidate } of ordered) {
    const key = normalizeCityName(candidate.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    localities.push(candidate);
  }
  return localities;
}

interface LocalityCandidate extends Locality {
  isNode: boolean;
}

function toLocalityCandidate(element: OverpassElement): LocalityCandidate | null {
  const tags = element.tags ?? {};
  const name = (tags['name:en'] ?? tags.name ?? '').trim();
  const point = pointOf(element);
  if (!name || !point || !tags.place) return null;
  const id = slugify(name);
  if (!id) return null;
  return { id, name, placeType: tags.place, ...point, isNode: element.type === 'node' };
}

export function toPoiPoints(elements: OverpassElement[]): PoiPoint[] {
  const points: PoiPoint[] = [];
  for (const element of elements) {
    if (!element.tags) continue;
    const kind = classifyPoi(element.tags);
    const point = pointOf(element);
    if (kind && point) points.push({ ...point, kind });
  }
  return points;
}

function pointOf(element: OverpassElement): { lat: number; lon: number } | null {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return { lat: element.lat, lon: element.lon };
  }
  if (element.center) return { lat: element.center.lat, lon: element.center.lon };
  return null;
}

export interface MetricsResult {
  metrics: LocalityMetrics[];
  /** Mapped places that fell inside at least one catchment. */
  poisUsed: number;
}

/** Counts every mapped place inside each locality's catchment circle. */
export function computeLocalityMetrics(
  localities: Locality[],
  pois: PoiPoint[],
  radiusKm: number,
): MetricsResult {
  const metrics = localities.map(emptyMetrics);
  if (metrics.length === 0) return { metrics, poisUsed: 0 };

  // One degree of latitude is ~111 km; a cheap box test skips most distance maths.
  const meanLat = localities.reduce((sum, l) => sum + l.lat, 0) / localities.length;
  const latMargin = radiusKm / 111 + 0.001;
  const lonMargin = latMargin / Math.max(0.2, Math.cos((meanLat * Math.PI) / 180));
  let poisUsed = 0;

  for (const poi of pois) {
    let used = false;
    for (const m of metrics) {
      if (Math.abs(poi.lat - m.locality.lat) > latMargin) continue;
      if (Math.abs(poi.lon - m.locality.lon) > lonMargin) continue;
      if (haversineKm(poi.lat, poi.lon, m.locality.lat, m.locality.lon) > radiusKm) continue;
      addPoi(m, poi);
      used = true;
    }
    if (used) poisUsed += 1;
  }

  return { metrics, poisUsed };
}

export interface DeriveOptions {
  /** Localities with fewer mapped businesses than this are not scored. */
  minPois: number;
  /** Keep at most this many localities, by mapped business count. */
  maxAreas: number;
}

export interface DeriveResult {
  areas: AreaSignals[];
  /** Localities dropped for having too little mapped data. */
  skippedLowData: number;
  /** Localities dropped by the `maxAreas` cap. */
  skippedByCap: number;
}

/** Scales raw counts to city-relative indices and builds the engine's input. */
export function deriveAreas(
  cityName: string,
  metrics: LocalityMetrics[],
  options: DeriveOptions,
): DeriveResult {
  const usable = metrics
    .filter((m) => m.commercialPois >= options.minPois)
    .sort(
      (a, b) =>
        b.commercialPois - a.commercialPois ||
        a.locality.name.localeCompare(b.locality.name, 'en'),
    );
  const kept = usable.slice(0, options.maxAreas);
  const centre = activityCentre(kept);

  const footfall = toIndex(kept.map((m) => m.commercialPois + 10 * m.transit + 5 * m.malls));
  const youngProfessionals = toIndex(kept.map((m) => m.offices));
  const families = toIndex(kept.map((m) => m.schools + m.playgrounds));
  const students = toIndex(kept.map((m) => m.higherEducation + m.dormitories));
  const competition = Object.fromEntries(
    COMPETITION_KEYS.map((key) => [key, toIndex(kept.map((m) => m.competition[key]))]),
  ) as Record<CompetitionKey, number[]>;

  const areas: AreaSignals[] = kept.map((m, i) => {
    const competitionIndex = Object.fromEntries(
      COMPETITION_KEYS.map((key) => [key, competition[key][i]]),
    ) as Record<CompetitionKey, number>;

    return {
      id: m.locality.id,
      name: m.locality.name,
      zone: zoneFor(cityName, centre, m.locality),
      traits: traitsFor(m, {
        youngProfessionals: youngProfessionals[i],
        families: families[i],
        competition: competitionIndex,
      }),
      footfall: footfall[i],
      youngProfessionals: youngProfessionals[i],
      families: families[i],
      students: students[i],
      competition: competitionIndex,
    };
  });

  return {
    areas,
    skippedLowData: metrics.length - usable.length,
    skippedByCap: usable.length - kept.length,
  };
}

function emptyMetrics(locality: Locality): LocalityMetrics {
  return {
    locality,
    competition: Object.fromEntries(COMPETITION_KEYS.map((key) => [key, 0])) as Record<
      CompetitionKey,
      number
    >,
    commercialPois: 0,
    offices: 0,
    higherEducation: 0,
    dormitories: 0,
    schools: 0,
    playgrounds: 0,
    transit: 0,
    malls: 0,
  };
}

function addPoi(m: LocalityMetrics, poi: PoiPoint): void {
  const { kind } = poi;
  for (const bucket of kind.buckets) m.competition[bucket] += 1;
  if (kind.buckets.length > 0) m.commercialPois += 1;
  if (kind.office) m.offices += 1;
  if (kind.higherEducation) m.higherEducation += 1;
  if (kind.dormitory) m.dormitories += 1;
  if (kind.school) m.schools += 1;
  if (kind.playground) m.playgrounds += 1;
  if (kind.transit) m.transit += 1;
  if (kind.mall) m.malls += 1;
}

/**
 * Percentile rank of each count within the city, 0-100. Mapping density in
 * OpenStreetMap is very uneven, so a linear scale would let one dense hub
 * flatten everything else; ranks keep every locality comparable and make
 * 50 mean "typical for this city", which is exactly what the engine's
 * competition baseline assumes. Ties share a rank; zero counts stay zero.
 */
export function toIndex(values: number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  if (Math.max(...values) <= 0) return values.map(() => 0);
  if (n === 1) return values.map((value) => (value > 0 ? 100 : 0));

  const order = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const ranks = new Array<number>(n).fill(0);
  let start = 0;
  while (start < n) {
    let end = start;
    while (end + 1 < n && order[end + 1].value === order[start].value) end += 1;
    const sharedRank = (start + end) / 2;
    for (let k = start; k <= end; k += 1) ranks[order[k].index] = sharedRank;
    start = end + 1;
  }

  return values.map((value, index) =>
    value > 0 ? Math.round((100 * ranks[index]) / (n - 1)) : 0,
  );
}

/** Where the city's mapped activity is concentrated; steadier than an administrative centroid. */
function activityCentre(metrics: LocalityMetrics[]): { lat: number; lon: number } | null {
  if (metrics.length === 0) return null;
  let weightTotal = 0;
  let lat = 0;
  let lon = 0;
  for (const m of metrics) {
    const weight = m.commercialPois + 1;
    weightTotal += weight;
    lat += weight * m.locality.lat;
    lon += weight * m.locality.lon;
  }
  return { lat: lat / weightTotal, lon: lon / weightTotal };
}

function zoneFor(
  cityName: string,
  centre: { lat: number; lon: number } | null,
  locality: Locality,
): string | undefined {
  if (!centre) return undefined;
  const distanceKm = haversineKm(centre.lat, centre.lon, locality.lat, locality.lon);
  if (distanceKm < CENTRAL_RADIUS_KM) return `Central ${cityName}`;
  const sector = compassSector(bearingDegrees(centre.lat, centre.lon, locality.lat, locality.lon));
  return `${sector} ${cityName}`;
}

function traitsFor(
  m: LocalityMetrics,
  index: {
    youngProfessionals: number;
    families: number;
    competition: Record<CompetitionKey, number>;
  },
): string[] {
  const traits: string[] = [];
  if (index.youngProfessionals >= 75) traits.push('Office hub');
  if (m.transit >= 1) traits.push('Transit connected');
  if (index.competition.food >= 75) traits.push('Dining hotspot');
  if (index.competition.retail >= 75) traits.push('Retail cluster');
  if (m.higherEducation >= 2) traits.push('Colleges nearby');
  if (index.families >= 75) traits.push('Schools and playgrounds');
  if (index.competition.healthcare >= 75) traits.push('Healthcare cluster');
  if (m.commercialPois < 20) traits.push('Sparse map coverage');
  return traits.slice(0, 3);
}
