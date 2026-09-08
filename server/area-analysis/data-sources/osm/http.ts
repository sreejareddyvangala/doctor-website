/**
 * A deliberately polite HTTP client for the public OpenStreetMap services.
 *
 * Nominatim's usage policy asks for an identifying User-Agent and at most one
 * request per second; the public Overpass instance asks for restraint too.
 * Every request from this process therefore goes through one queue that
 * spaces calls out, retries transient failures with backoff (and backs off
 * hard when told to slow down), and gives up with a typed `UpstreamError`
 * the HTTP layer can report cleanly.
 */

import { UpstreamError } from '../../errors.ts';
import type { Logger } from '../../../logger.ts';

export interface PoliteHttpOptions {
  /** Identifies this deployment to the OSM services. Required by their policies. */
  userAgent: string;
  /** Injectable for tests. Defaults to the global fetch. */
  fetch?: typeof fetch;
  /** Minimum gap between consecutive requests. Defaults to 1100 ms. */
  minIntervalMs?: number;
  /** Waits before retrying network errors and 5xx responses. Defaults to 2 s then 5 s. */
  retryDelaysMs?: number[];
  /**
   * Waits before retrying after a 429. Defaults to 10 s then 30 s, or longer
   * when the service sends a Retry-After header.
   */
  rateLimitDelaysMs?: number[];
  logger?: Pick<Logger, 'warn'>;
}

export interface JsonRequest {
  method?: 'GET' | 'POST';
  /** Form-encoded body for POST requests. */
  body?: string;
  timeoutMs: number;
  /** Retries after the first attempt. Defaults to 2. */
  maxRetries?: number;
}

export interface PoliteHttp {
  /** `upstream` names the service in error messages, e.g. "OpenStreetMap Overpass". */
  requestJson<T>(upstream: string, url: string, request: JsonRequest): Promise<T>;
}

export function createPoliteHttp(options: PoliteHttpOptions): PoliteHttp {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const minIntervalMs = options.minIntervalMs ?? 1100;
  const retryDelaysMs = options.retryDelaysMs ?? [2000, 5000];
  const rateLimitDelaysMs = options.rateLimitDelaysMs ?? [10_000, 30_000];

  let queue: Promise<unknown> = Promise.resolve();
  let lastRequestAt = 0;

  async function attempt<T>(upstream: string, url: string, request: JsonRequest): Promise<T> {
    const maxRetries = request.maxRetries ?? 2;

    for (let attemptIndex = 0; ; attemptIndex += 1) {
      const wait = lastRequestAt + minIntervalMs - Date.now();
      if (wait > 0) await sleep(wait);
      lastRequestAt = Date.now();

      let response: Response;
      try {
        response = await fetchImpl(url, {
          method: request.method ?? 'GET',
          headers: {
            'user-agent': options.userAgent,
            accept: 'application/json',
            ...(request.body ? { 'content-type': 'application/x-www-form-urlencoded' } : {}),
          },
          body: request.body,
          signal: AbortSignal.timeout(request.timeoutMs),
        });
      } catch (error) {
        if (attemptIndex < maxRetries) {
          const delay = pick(retryDelaysMs, attemptIndex);
          options.logger?.warn(
            `[osm] ${upstream} unreachable (${describe(error)}); retrying in ${delay} ms.`,
          );
          await sleep(delay);
          continue;
        }
        throw new UpstreamError(upstream, `${upstream} could not be reached (${describe(error)}).`, {
          retryable: true,
          cause: error,
        });
      }

      if (response.ok) {
        try {
          return (await response.json()) as T;
        } catch (error) {
          throw new UpstreamError(upstream, `${upstream} returned a response that was not JSON.`, {
            retryable: true,
            cause: error,
          });
        }
      }

      const rateLimited = response.status === 429;
      const retryable = rateLimited || response.status >= 500;
      if (retryable && attemptIndex < maxRetries) {
        const delay = rateLimited
          ? rateLimitDelay(response, pick(rateLimitDelaysMs, attemptIndex))
          : pick(retryDelaysMs, attemptIndex);
        options.logger?.warn(
          `[osm] ${upstream} responded ${response.status}; retrying in ${delay} ms.`,
        );
        await sleep(delay);
        continue;
      }
      throw new UpstreamError(
        upstream,
        rateLimited
          ? `${upstream} is rate-limiting this server.`
          : `${upstream} responded with HTTP ${response.status}.`,
        { retryable },
      );
    }
  }

  return {
    requestJson<T>(upstream: string, url: string, request: JsonRequest): Promise<T> {
      // Serialise through the queue whether or not the previous request failed.
      const run = () => attempt<T>(upstream, url, request);
      const result = queue.then(run, run);
      queue = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    },
  };
}

function pick(delays: number[], attemptIndex: number): number {
  return delays[Math.min(attemptIndex, delays.length - 1)] ?? 0;
}

/** Honour a Retry-After header (seconds) when it asks for more than our own backoff. */
function rateLimitDelay(response: Response, fallbackMs: number): number {
  const header = Number(response.headers.get('retry-after'));
  return Number.isFinite(header) && header > 0 ? Math.max(header * 1000, fallbackMs) : fallbackMs;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.name === 'TimeoutError' ? 'timed out' : error.message;
  return String(error);
}
