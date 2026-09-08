/**
 * Chooses the `AreaDataSource` implementation from configuration.
 *
 * To connect another provider:
 *   1. Implement `AreaDataSource` (see `./types.ts`) in a sibling folder,
 *      reading its credentials from `ServerEnv`.
 *   2. Add its id to `DATA_SOURCE_IDS` in `server/env.ts`.
 *   3. Add a case below.
 * The engine, the HTTP handler and the UI need no changes.
 */

import type { ServerEnv } from '../../env.ts';
import type { Logger } from '../../logger.ts';
import { createMockAreaDataSource } from './mock/index.ts';
import { createOsmAreaDataSource } from './osm/index.ts';
import type { AreaDataSource } from './types.ts';

export function createAreaDataSource(
  env: ServerEnv,
  options: { logger?: Logger } = {},
): AreaDataSource {
  switch (env.dataSource) {
    case 'osm':
      return createOsmAreaDataSource({
        overpassUrl: env.osm.overpassUrl,
        nominatimUrl: env.osm.nominatimUrl,
        userAgent: env.osm.userAgent,
        countryCodes: env.osm.countryCodes,
        scope: env.osm.scope,
        cacheDir: env.osm.cacheDir,
        cacheTtlMs: env.osm.cacheTtlHours * 60 * 60 * 1000,
        catchmentRadiusM: env.osm.catchmentRadiusM,
        maxAreas: env.osm.maxAreas,
        minPois: env.osm.minPois,
        suggestedCities: env.osm.suggestedCities,
        logger: options.logger,
      });
    case 'mock':
      return createMockAreaDataSource({ latencyMs: env.mockLatencyMs });
    default:
      return unreachable(env.dataSource);
  }
}

function unreachable(value: never): never {
  throw new Error(`No data source registered for "${String(value)}".`);
}
