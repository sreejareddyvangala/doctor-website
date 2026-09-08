import type { CompetitionKey } from '../types.ts';

/** A city as resolved by Nominatim. */
export interface ResolvedCity {
  /** Canonical English name, e.g. "Hyderabad". */
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  osmType: 'relation' | 'way' | 'node';
  osmId: number;
  bbox: { south: number; west: number; north: number; east: number };
}

/** The subset of an Overpass JSON element this source reads. */
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

/** A named place inside the city that becomes one recommended area. */
export interface Locality {
  id: string;
  name: string;
  placeType: string;
  lat: number;
  lon: number;
}

/** What one mapped place contributes, derived purely from its OSM tags. */
export interface PoiClass {
  buckets: CompetitionKey[];
  office: boolean;
  higherEducation: boolean;
  dormitory: boolean;
  school: boolean;
  playground: boolean;
  transit: boolean;
  mall: boolean;
}

export interface PoiPoint {
  lat: number;
  lon: number;
  kind: PoiClass;
}

/** Raw counts for one locality before scaling. */
export interface LocalityMetrics {
  locality: Locality;
  competition: Record<CompetitionKey, number>;
  /** Places counted in any competition bucket. */
  commercialPois: number;
  offices: number;
  higherEducation: number;
  dormitories: number;
  schools: number;
  playgrounds: number;
  transit: number;
  malls: number;
}
