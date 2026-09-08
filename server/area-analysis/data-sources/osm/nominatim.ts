/**
 * Resolves a typed city name to its OpenStreetMap boundary via Nominatim.
 * One request per lookup; results are cached by the data source.
 */

import type { PoliteHttp } from './http.ts';
import type { ResolvedCity } from './types.ts';

export interface NominatimOptions {
  baseUrl: string;
  /** ISO 3166-1 alpha-2 codes to bias results, e.g. ["in"]. Empty = worldwide. */
  countryCodes: string[];
  timeoutMs?: number;
}

/** The fields of a Nominatim `jsonv2` search result this module reads. */
interface NominatimResult {
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  category?: string;
  type: string;
  addresstype?: string;
  name?: string;
  display_name: string;
  /** [south, north, west, east] as strings. */
  boundingbox: [string, string, string, string];
}

/** Settlements: what a user means by "a city". */
const SETTLEMENT_TYPES = new Set(['city', 'town', 'municipality']);
/** Larger units that share the city's name, e.g. "Pune District". Accepted only as a last resort. */
const DISTRICT_TYPES = new Set(['county', 'district', 'state_district']);

export async function resolveCity(
  http: PoliteHttp,
  options: NominatimOptions,
  query: string,
): Promise<ResolvedCity | null> {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '5',
    'accept-language': 'en',
  });
  if (options.countryCodes.length > 0) params.set('countrycodes', options.countryCodes.join(','));

  const results = await http.requestJson<NominatimResult[]>(
    'OpenStreetMap Nominatim',
    `${options.baseUrl.replace(/\/+$/, '')}/search?${params.toString()}`,
    { timeoutMs: options.timeoutMs ?? 15_000 },
  );

  const candidates = (Array.isArray(results) ? results : []).filter(isCityLike);
  // Stable sort: Nominatim's own relevance order breaks ties.
  const best = candidates
    .map((result, index) => ({ result, index, score: preference(result) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.result;
  return best ? toResolvedCity(best) : null;
}

function isCityLike(result: NominatimResult): boolean {
  const type = result.addresstype ?? result.type;
  if (result.category === 'boundary' && result.type === 'administrative') return true;
  if (result.category === 'place' && (SETTLEMENT_TYPES.has(type) || type === 'village')) return true;
  return false;
}

/**
 * The settlement itself beats the district that carries its name, and a
 * boundary relation beats a bare point because it gives a precise extent.
 * For "Pune", Nominatim lists the city node and the district relation;
 * without this the district's enormous bounding box would be queried.
 */
function preference(result: NominatimResult): number {
  const type = result.addresstype ?? result.type;
  let score = 0;
  if (SETTLEMENT_TYPES.has(type)) score += 20;
  else if (type === 'village') score += 10;
  else if (DISTRICT_TYPES.has(type)) score += 5;
  else if (result.category === 'boundary') score += 3;
  if (result.osm_type === 'relation') score += 2;
  else if (result.osm_type === 'way') score += 1;
  return score;
}

function toResolvedCity(result: NominatimResult): ResolvedCity {
  const [south, north, west, east] = result.boundingbox.map(Number);
  const osmType =
    result.osm_type === 'relation' || result.osm_type === 'way' ? result.osm_type : 'node';

  return {
    name: result.name?.trim() || result.display_name.split(',')[0].trim(),
    displayName: result.display_name,
    lat: Number(result.lat),
    lon: Number(result.lon),
    osmType,
    osmId: result.osm_id,
    bbox: { south, west, north, east },
  };
}
