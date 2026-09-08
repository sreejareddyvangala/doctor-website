import { isCategoryId } from '../../shared/area-analysis/catalog.ts';
import type { AreaAnalysisRequest } from '../../shared/area-analysis/contracts.ts';

export type ParseResult<T> = { ok: true; value: T } | { ok: false; issues: string[] };

export const CITY_MIN_LENGTH = 2;
export const CITY_MAX_LENGTH = 60;

/** Letters (any script), marks, spaces, dots, apostrophes and hyphens. */
const CITY_PATTERN = /^[\p{L}\p{M}\s.'-]+$/u;

/**
 * Validates an untrusted request body. Every problem is reported at once so
 * the client can show them together instead of one per round-trip.
 */
export function parseAreaAnalysisRequest(input: unknown): ParseResult<AreaAnalysisRequest> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, issues: ['Request body must be a JSON object.'] };
  }

  const { categoryId, city } = input as Record<string, unknown>;
  const issues: string[] = [];

  if (!isCategoryId(categoryId)) {
    issues.push('categoryId must be one of the supported business categories.');
  }

  const cityText = typeof city === 'string' ? city.trim().replace(/\s+/g, ' ') : '';
  if (typeof city !== 'string') {
    issues.push('city is required.');
  } else if (cityText.length < CITY_MIN_LENGTH) {
    issues.push(`city must be at least ${CITY_MIN_LENGTH} characters.`);
  } else if (cityText.length > CITY_MAX_LENGTH) {
    issues.push(`city must be at most ${CITY_MAX_LENGTH} characters.`);
  } else if (!CITY_PATTERN.test(cityText)) {
    issues.push('city may only contain letters, spaces, dots, apostrophes and hyphens.');
  }

  if (issues.length > 0 || !isCategoryId(categoryId)) {
    return { ok: false, issues };
  }

  return { ok: true, value: { categoryId, city: cityText } };
}
