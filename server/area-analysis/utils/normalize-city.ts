/**
 * Folds a user-typed city name into a comparison key: case-insensitive,
 * accent-insensitive, punctuation ignored, whitespace collapsed.
 * "  Bengaluru " -> "bengaluru", "Navi-Mumbai" -> "navi mumbai".
 */
export function normalizeCityName(input: string): string {
  return input
    .normalize('NFKD')
    // NFKD splits accented letters into base letter + combining mark; drop the marks.
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
