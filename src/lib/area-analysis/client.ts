/**
 * Browser client for the area-analysis API.
 *
 * The only place the UI talks to the backend. The endpoint defaults to the
 * same origin (served by the Vite dev/preview server and `server/index.ts`);
 * set `VITE_AREA_ANALYSIS_API_URL` to point at a separately hosted API.
 */

import type {
  ApiErrorBody,
  ApiErrorCode,
  AreaAnalysisRequest,
  AreaAnalysisResponse,
  CoveredCitiesResponse,
} from '@shared/area-analysis/contracts';

const DEFAULT_BASE_URL = '/api/area-analysis';

export const AREA_ANALYSIS_API_URL = (
  import.meta.env.VITE_AREA_ANALYSIS_API_URL || DEFAULT_BASE_URL
).replace(/\/+$/, '');

export type ClientErrorCode = ApiErrorCode | 'NETWORK_ERROR' | 'BAD_RESPONSE';

export class AreaAnalysisApiError extends Error {
  readonly code: ClientErrorCode;
  readonly status: number | undefined;
  readonly issues: string[];

  constructor(message: string, code: ClientErrorCode, status?: number, issues: string[] = []) {
    super(message);
    this.name = 'AreaAnalysisApiError';
    this.code = code;
    this.status = status;
    this.issues = issues;
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
}

export function analyzeAreas(
  request: AreaAnalysisRequest,
  options: RequestOptions = {},
): Promise<AreaAnalysisResponse> {
  return requestJson<AreaAnalysisResponse>(AREA_ANALYSIS_API_URL, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(request),
    signal: options.signal,
  });
}

export function fetchCoveredCities(options: RequestOptions = {}): Promise<CoveredCitiesResponse> {
  return requestJson<CoveredCitiesResponse>(`${AREA_ANALYSIS_API_URL}/cities`, {
    headers: { accept: 'application/json' },
    signal: options.signal,
  });
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new AreaAnalysisApiError(
      'Could not reach the analysis service. Check your connection and try again.',
      'NETWORK_ERROR',
    );
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const details = isApiErrorBody(data) ? data.error : undefined;
    throw new AreaAnalysisApiError(
      details?.message ??
        `The analysis service returned an unexpected error (HTTP ${response.status}).`,
      details?.code ?? 'BAD_RESPONSE',
      response.status,
      details?.issues ?? [],
    );
  }

  if (data === null || typeof data !== 'object') {
    throw new AreaAnalysisApiError(
      'The analysis service returned an unreadable response.',
      'BAD_RESPONSE',
      response.status,
    );
  }

  return data as T;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false;
  const { error } = value as { error: unknown };
  return typeof error === 'object' && error !== null;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/** Normalises anything thrown by the client into an `AreaAnalysisApiError`. */
export function toApiError(error: unknown): AreaAnalysisApiError {
  if (error instanceof AreaAnalysisApiError) return error;
  const message =
    error instanceof Error && error.message
      ? error.message
      : 'Something went wrong while analysing areas.';
  return new AreaAnalysisApiError(message, 'BAD_RESPONSE');
}
