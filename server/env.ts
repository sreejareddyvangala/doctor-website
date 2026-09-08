/**
 * Server-side configuration, read from the environment once at startup.
 *
 * Nothing in this file is ever shipped to the browser. Credentials for real
 * data sources belong here too: read them from `raw`, never inline them.
 * See `.env.example` for the variables and their meaning.
 */

export type RawEnv = Record<string, string | undefined>;

/** Ids of the data-source implementations `createAreaDataSource` knows about. */
export const DATA_SOURCE_IDS = ['osm', 'mock'] as const;
export type DataSourceId = (typeof DATA_SOURCE_IDS)[number];

/** How the OSM source bounds a city: its bounding box (fast) or its exact boundary (slow). */
export const OSM_SCOPES = ['bbox', 'area'] as const;
export type OsmScope = (typeof OSM_SCOPES)[number];

/** Used when AREA_OSM_USER_AGENT is unset; the app warns because OSM asks to be told who is calling. */
export const DEFAULT_OSM_USER_AGENT =
  'AreaScout/0.1 (unidentified deployment; set AREA_OSM_USER_AGENT)';

export interface OsmEnv {
  overpassUrl: string;
  nominatimUrl: string;
  /** Identifies this deployment to the OSM services, as their usage policies require. */
  userAgent: string;
  /** ISO 3166-1 alpha-2 codes that bias city lookups. Empty means worldwide. */
  countryCodes: string[];
  /** Spatial scope for Overpass queries. */
  scope: OsmScope;
  /** Directory for the on-disk cache, relative to the working directory. */
  cacheDir: string;
  cacheTtlHours: number;
  /** Catchment radius around each locality centre, in metres. */
  catchmentRadiusM: number;
  /** Most localities to score per city. */
  maxAreas: number;
  /** Fewest mapped businesses a locality needs to be scored. */
  minPois: number;
  /** Offered as suggestions in the UI before any city has been analysed. */
  suggestedCities: string[];
}

export interface ServerEnv {
  /** Which implementation backs `AreaDataSource`. */
  dataSource: DataSourceId;
  /** Artificial delay for the mock source so loading states are visible. */
  mockLatencyMs: number;
  /** Origins allowed to call the API cross-origin. Empty means same-origin only. */
  allowedOrigins: string[];
  /** Port for the standalone server (`node server/index.ts`). */
  port: number;
  osm: OsmEnv;
}

export function readServerEnv(raw: RawEnv): ServerEnv {
  return {
    dataSource: readChoice(raw.AREA_DATA_SOURCE, 'AREA_DATA_SOURCE', DATA_SOURCE_IDS, 'osm'),
    mockLatencyMs: readInteger(raw.AREA_MOCK_LATENCY_MS, 'AREA_MOCK_LATENCY_MS', 700, 0, 10_000),
    allowedOrigins: readList(raw.AREA_API_ALLOWED_ORIGINS),
    port: readInteger(raw.PORT, 'PORT', 8787, 1, 65_535),
    osm: {
      overpassUrl: readUrl(
        raw.AREA_OSM_OVERPASS_URL,
        'AREA_OSM_OVERPASS_URL',
        'https://overpass-api.de/api/interpreter',
      ),
      nominatimUrl: readUrl(
        raw.AREA_OSM_NOMINATIM_URL,
        'AREA_OSM_NOMINATIM_URL',
        'https://nominatim.openstreetmap.org',
      ),
      userAgent: (raw.AREA_OSM_USER_AGENT ?? '').trim() || DEFAULT_OSM_USER_AGENT,
      countryCodes: readList(raw.AREA_OSM_COUNTRY_CODES).map((code) => code.toLowerCase()),
      scope: readChoice(raw.AREA_OSM_SCOPE, 'AREA_OSM_SCOPE', OSM_SCOPES, 'bbox'),
      cacheDir: (raw.AREA_OSM_CACHE_DIR ?? '').trim() || '.cache/osm',
      cacheTtlHours: readInteger(raw.AREA_OSM_CACHE_TTL_HOURS, 'AREA_OSM_CACHE_TTL_HOURS', 168, 1, 8760),
      catchmentRadiusM: readInteger(
        raw.AREA_OSM_CATCHMENT_RADIUS_M,
        'AREA_OSM_CATCHMENT_RADIUS_M',
        1500,
        300,
        5000,
      ),
      maxAreas: readInteger(raw.AREA_OSM_MAX_AREAS, 'AREA_OSM_MAX_AREAS', 60, 5, 200),
      minPois: readInteger(raw.AREA_OSM_MIN_POIS, 'AREA_OSM_MIN_POIS', 5, 0, 1000),
      suggestedCities: readList(
        raw.AREA_OSM_SUGGESTED_CITIES,
        'Hyderabad,Bengaluru,Mumbai,Chennai,Pune',
      ),
    },
  };
}

function readChoice<T extends string>(
  value: string | undefined,
  name: string,
  choices: readonly T[],
  fallback: T,
): T {
  const text = (value ?? '').trim();
  if (text === '') return fallback;
  const match = choices.find((choice) => choice === text);
  if (!match) {
    throw new Error(`Unsupported ${name} "${text}". Known values: ${choices.join(', ')}.`);
  }
  return match;
}

function readInteger(
  value: string | undefined,
  name: string,
  fallback: number,
  min: number,
  max: number,
): number {
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}, got "${value}".`);
  }
  return parsed;
}

function readUrl(value: string | undefined, name: string, fallback: string): string {
  const text = (value ?? '').trim() || fallback;
  try {
    new URL(text);
  } catch {
    throw new Error(`${name} must be a valid URL, got "${text}".`);
  }
  return text;
}

function readList(value: string | undefined, fallback = ''): string[] {
  return ((value ?? '').trim() || fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
