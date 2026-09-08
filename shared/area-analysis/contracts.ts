/**
 * Wire contract between the Area Finder UI and the area-analysis API.
 *
 * Imported by BOTH the browser bundle (`src/`) and the server (`server/`), so
 * it must stay free of runtime dependencies and of anything
 * environment-specific: types, plus the few constants the UI needs to label
 * results exactly the way the engine produced them.
 */

import type { CategoryId } from './catalog.ts';

export type PotentialLevel = 'high' | 'medium' | 'low';

/** Score boundaries that map a 0-100 opportunity score to a potential level. */
export const POTENTIAL_THRESHOLDS = {
  /** Scores at or above this are "High". */
  high: 75,
  /** Scores at or above this (and below `high`) are "Medium"; anything lower is "Low". */
  medium: 55,
} as const;

export function potentialFromScore(score: number): PotentialLevel {
  if (score >= POTENTIAL_THRESHOLDS.high) return 'high';
  if (score >= POTENTIAL_THRESHOLDS.medium) return 'medium';
  return 'low';
}

/** The signals an area can carry. Data sources supply whichever they can. */
export type SignalName =
  | 'population'
  | 'footfall'
  | 'affluence'
  | 'youngProfessionals'
  | 'families'
  | 'students'
  | 'growth'
  | 'competition';

/**
 * How trustworthy a signal is: measured directly, estimated from a proxy,
 * hand-written sample values, or not supplied by the current data source.
 */
export type SignalProvenance = 'measured' | 'proxy' | 'sample' | 'unavailable';

export interface SignalCoverage {
  signal: SignalName;
  provenance: SignalProvenance;
  /** Where the value came from, e.g. "OpenStreetMap". */
  source: string;
  /** How it was derived, in plain language. */
  method?: string;
}

export interface AreaAnalysisRequest {
  /** One of the ids in `BUSINESS_CATEGORIES`. */
  categoryId: CategoryId;
  /** Free-text city name as typed by the user, e.g. "Hyderabad". */
  city: string;
}

/**
 * The components every score is built from, each on a 0-100 scale. A
 * component is `null` when the data source supplied none of its signals;
 * the score is then computed from the remaining components.
 */
export interface ScoreBreakdown {
  /** How well the area's residents and visitors match the category's audience. */
  audienceFit: number | null;
  /** Resident population and daily footfall, weighted for the category. */
  activity: number | null;
  /** Pace of new residential and commercial development. */
  growth: number | null;
  /** 100 minus the density of directly competing businesses. */
  whiteSpace: number;
}

export interface AreaRecommendation {
  /** 1 = strongest opportunity. */
  rank: number;
  areaId: string;
  areaName: string;
  /** Broad part of the city, e.g. "West Hyderabad". Purely descriptive. */
  zone?: string;
  /** Opportunity score, 0-100. */
  score: number;
  potential: PotentialLevel;
  /** One or two plain-language sentences on why the area ranks where it does. */
  explanation: string;
  /** Short descriptive tags for the area, e.g. "IT corridor". */
  highlights: string[];
  breakdown: ScoreBreakdown;
}

export interface DataSourceInfo {
  id: string;
  /** Human-readable name shown in the UI, e.g. "OpenStreetMap". */
  label: string;
  /** True when results come from illustrative sample data rather than real signals. */
  isSample: boolean;
  /** Credit line the UI must display, e.g. for OpenStreetMap's licence. */
  attribution?: string;
  attributionUrl?: string;
  /** True when any city can be looked up, false when coverage is a fixed list. */
  acceptsAnyCity?: boolean;
  /** Shown when a city cannot be found, in the source's own words. */
  missingCityHint?: string;
}

export interface AreaAnalysisQuery {
  categoryId: CategoryId;
  categoryLabel: string;
  /** Canonical city name once resolved (e.g. "Bengaluru" for "bangalore"). */
  city: string;
}

export interface AreaAnalysisSuccess {
  status: 'ok';
  query: AreaAnalysisQuery;
  /** Ranked best-first. */
  results: AreaRecommendation[];
  totals: { analyzed: number; high: number; medium: number; low: number };
  dataSource: DataSourceInfo;
  /** ISO 8601 timestamp of when the analysis ran. */
  analyzedAt: string;
  /** Per-signal provenance, so the UI can label measured versus estimated data. */
  coverage?: SignalCoverage[];
  /** Plain-language remarks about this run, e.g. how many places were counted. */
  notes?: string[];
  /** Localities the data source found but could not score. */
  skippedAreas?: number;
}

export interface AreaAnalysisNoCoverage {
  status: 'no_coverage';
  query: AreaAnalysisQuery;
  /** Cities the current data source can analyse, for the UI to suggest. */
  availableCities: string[];
  dataSource: DataSourceInfo;
  /** Why the city could not be analysed, in plain language. */
  reason?: string;
}

export type AreaAnalysisResponse = AreaAnalysisSuccess | AreaAnalysisNoCoverage;

export interface CoveredCitiesResponse {
  cities: string[];
  dataSource: DataSourceInfo;
}

export type ApiErrorCode =
  | 'INVALID_REQUEST'
  | 'INVALID_JSON'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'PAYLOAD_TOO_LARGE'
  | 'UPSTREAM_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    /** Field-level problems, present for INVALID_REQUEST. */
    issues?: string[];
  };
}
