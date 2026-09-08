/**
 * Errors the HTTP layer knows how to translate into a specific status code.
 * Anything else is treated as a bug and becomes a generic 500.
 */
export class UpstreamError extends Error {
  /** Which external system failed, e.g. "OpenStreetMap Overpass". */
  readonly upstream: string;
  /** True when trying again later is reasonable (rate limit, timeout, outage). */
  readonly retryable: boolean;

  constructor(
    upstream: string,
    message: string,
    options: { retryable?: boolean; cause?: unknown } = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'UpstreamError';
    this.upstream = upstream;
    this.retryable = options.retryable ?? true;
  }
}
