/**
 * HTTP layer for the area-analysis API, built on the standard Request and
 * Response types so the same code runs under Vite's dev server, a plain
 * Node server, or an edge runtime with only a thin adapter.
 *
 *   POST {basePath}          AreaAnalysisRequest -> AreaAnalysisResponse
 *   GET  {basePath}/cities   -> CoveredCitiesResponse
 *
 * Errors are always JSON in the `ApiErrorBody` shape.
 */

import type {
  ApiErrorBody,
  ApiErrorCode,
  CoveredCitiesResponse,
} from '../../shared/area-analysis/contracts.ts';
import { UpstreamError } from './errors.ts';
import { analyzeAreas, type AnalysisDependencies } from './service.ts';
import { parseAreaAnalysisRequest } from './validate.ts';

export type FetchHandler = (request: Request) => Promise<Response>;

export interface Logger {
  error(message: string): void;
}

export interface HandlerOptions {
  /** URL prefix the handler is mounted at. Defaults to "/api/area-analysis". */
  basePath?: string;
  /** Origins allowed to call the API cross-origin. "*" allows any origin. */
  allowedOrigins?: string[];
  logger?: Logger;
}

export const DEFAULT_BASE_PATH = '/api/area-analysis';

export function createAreaAnalysisHandler(
  deps: AnalysisDependencies,
  options: HandlerOptions = {},
): FetchHandler {
  const basePath = (options.basePath ?? DEFAULT_BASE_PATH).replace(/\/+$/, '');
  const allowedOrigins = options.allowedOrigins ?? [];
  const logger = options.logger ?? console;

  return async (request) => {
    const cors = corsHeaders(request.headers.get('origin'), allowedOrigins);

    let response: Response;
    try {
      response = await route(request, basePath, deps);
    } catch (error) {
      if (error instanceof UpstreamError) {
        logger.error(
          `[area-analysis] ${error.upstream} failed for ${request.method} ${request.url}: ${error.message}`,
        );
        response = errorResponse(
          503,
          'UPSTREAM_UNAVAILABLE',
          `${error.upstream} is not responding right now. ${
            error.retryable ? 'Please try again in a minute.' : 'Please try again later.'
          }`,
        );
        response.headers.set('retry-after', '60');
      } else {
        logger.error(`[area-analysis] ${request.method} ${request.url} failed: ${describe(error)}`);
        response = errorResponse(
          500,
          'INTERNAL_ERROR',
          'The analysis could not be completed. Please try again.',
        );
      }
    }

    for (const [name, value] of Object.entries(cors)) {
      response.headers.set(name, value);
    }
    return response;
  };
}

async function route(
  request: Request,
  basePath: string,
  deps: AnalysisDependencies,
): Promise<Response> {
  const path = new URL(request.url).pathname.replace(/\/+$/, '');
  if (path !== basePath && !path.startsWith(`${basePath}/`)) return notFound();

  // Preflight for cross-origin callers. CORS headers are added by the caller.
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });

  switch (path.slice(basePath.length)) {
    case '':
      return request.method === 'POST' ? analyze(request, deps) : methodNotAllowed('POST');
    case '/cities':
      return request.method === 'GET' ? cities(deps) : methodNotAllowed('GET');
    default:
      return notFound();
  }
}

async function analyze(request: Request, deps: AnalysisDependencies): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Request body must be valid JSON.');
  }

  const parsed = parseAreaAnalysisRequest(body);
  if (!parsed.ok) {
    return errorResponse(
      400,
      'INVALID_REQUEST',
      'The request is missing required fields or has invalid values.',
      parsed.issues,
    );
  }

  return json(200, await analyzeAreas(parsed.value, deps));
}

async function cities(deps: AnalysisDependencies): Promise<Response> {
  const body: CoveredCitiesResponse = {
    cities: await deps.dataSource.listCities(),
    dataSource: deps.dataSource.info,
  };
  return json(200, body);
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  issues?: string[],
): Response {
  const body: ApiErrorBody = { error: { code, message, ...(issues ? { issues } : {}) } };
  return json(status, body);
}

function notFound(): Response {
  return errorResponse(404, 'NOT_FOUND', 'No such endpoint.');
}

function methodNotAllowed(allow: string): Response {
  const response = errorResponse(405, 'METHOD_NOT_ALLOWED', `Use ${allow} for this endpoint.`);
  response.headers.set('allow', allow);
  return response;
}

function corsHeaders(origin: string | null, allowedOrigins: string[]): Record<string, string> {
  if (!origin || allowedOrigins.length === 0) return {};
  if (!allowedOrigins.includes('*') && !allowedOrigins.includes(origin)) return {};

  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'origin',
  };
}

function describe(error: unknown): string {
  return error instanceof Error ? (error.stack ?? error.message) : String(error);
}
