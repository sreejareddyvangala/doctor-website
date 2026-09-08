/**
 * Composition root: turns raw environment variables into a ready-to-serve
 * API handler. Every runtime entry point (the Vite middleware, the standalone
 * server, a future edge function) goes through this one function so they can
 * never drift apart in how they are configured.
 */

import { createAreaDataSource } from './area-analysis/data-sources/index.ts';
import {
  createAreaAnalysisHandler,
  DEFAULT_BASE_PATH,
  type FetchHandler,
} from './area-analysis/handler.ts';
import { DEFAULT_OSM_USER_AGENT, readServerEnv, type RawEnv, type ServerEnv } from './env.ts';
import { consoleLogger, type Logger } from './logger.ts';

export interface AreaAnalysisApp {
  env: ServerEnv;
  /** URL prefix the handler answers under, e.g. "/api/area-analysis". */
  basePath: string;
  handler: FetchHandler;
}

export function createApp(rawEnv: RawEnv, options: { logger?: Logger } = {}): AreaAnalysisApp {
  const logger = options.logger ?? consoleLogger;
  const env = readServerEnv(rawEnv);

  if (env.dataSource === 'osm' && env.osm.userAgent === DEFAULT_OSM_USER_AGENT) {
    logger.warn(
      '[osm] AREA_OSM_USER_AGENT is not set. OpenStreetMap asks every application to identify itself; set it to something like "AreaScout/1.0 (you@example.com)".',
    );
  }

  const dataSource = createAreaDataSource(env, { logger });
  const handler = createAreaAnalysisHandler(
    { dataSource },
    { basePath: DEFAULT_BASE_PATH, allowedOrigins: env.allowedOrigins, logger },
  );

  return { env, basePath: DEFAULT_BASE_PATH, handler };
}

/** True when a request path belongs to the API rather than the SPA. */
export function isApiPath(url: string | undefined, basePath: string): boolean {
  if (!url) return false;
  return url === basePath || url.startsWith(`${basePath}/`) || url.startsWith(`${basePath}?`);
}
