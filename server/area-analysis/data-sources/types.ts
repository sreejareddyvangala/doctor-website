/**
 * The boundary between the analysis engine and the outside world.
 *
 * The engine only ever sees `AreaSignals`. Where those numbers come from,
 * OpenStreetMap today, census / mobility / property data later, is the job
 * of an `AreaDataSource` implementation, selected in `./index.ts`.
 */

import type {
  DataSourceInfo,
  SignalCoverage,
} from '../../../shared/area-analysis/contracts.ts';

/** Buckets of existing businesses an area reports competition density for. */
export const COMPETITION_KEYS = [
  'fitness',
  'food',
  'education',
  'healthcare',
  'retail',
  'beauty',
  'services',
] as const;

export type CompetitionKey = (typeof COMPETITION_KEYS)[number];

/**
 * Everything the engine knows about one locality. Every numeric signal is an
 * index on a 0-100 scale relative to the city (100 = the highest in the city),
 * which keeps sources with different units comparable.
 *
 * A source supplies whichever demographic signals it can and omits the rest;
 * the engine re-normalises over what is present. Competition is required,
 * because measuring existing businesses is the one thing every source must do.
 */
export interface AreaSignals {
  /** Stable, URL-safe id, unique within the city. */
  id: string;
  name: string;
  /** Broad part of the city, e.g. "West Hyderabad". Optional, descriptive only. */
  zone?: string;
  /** Short descriptive tags surfaced to the user, e.g. "IT corridor". */
  traits: string[];

  /** Resident population. */
  population?: number;
  /** Daily visitor and commuter activity. */
  footfall?: number;
  /** Income and spending power. */
  affluence?: number;
  /** Share of working residents and workers aged roughly 22-40. */
  youngProfessionals?: number;
  /** Households with children. */
  families?: number;
  /** Student presence: colleges, hostels, coaching hubs. */
  students?: number;
  /** Pace of new residential and commercial development. */
  growth?: number;

  /** Density of existing businesses per bucket (100 = saturated). */
  competition: Record<CompetitionKey, number>;
}

export interface CityAreas {
  /** Canonical city name, e.g. "Bengaluru". */
  city: string;
  areas: AreaSignals[];
  /** Which signals this source measured, estimated, or could not supply. */
  coverage?: SignalCoverage[];
  /** Plain-language remarks about how the data was assembled. */
  notes?: string[];
  /** Localities found but not scored, e.g. for lack of mapped data. */
  skippedAreas?: number;
}

export interface AreaDataSource {
  readonly info: DataSourceInfo;
  /** Cities to suggest in the UI, in display order. */
  listCities(): Promise<string[]>;
  /**
   * Resolve a user-typed city (any casing, common aliases) to its localities.
   * Returns `null` when the city is unknown; never throws for that case.
   * Throws `UpstreamError` when an external service fails.
   */
  getCityAreas(cityQuery: string): Promise<CityAreas | null>;
}
