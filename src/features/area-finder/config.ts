/**
 * Product identity for the Area Finder. Change the name here and it updates
 * everywhere: header, document title, footer, route.
 */
export const APP = {
  name: 'AreaScout',
  tagline: 'Campaign area recommendations',
  route: '/area-finder',
} as const;

/** Ranked areas shown before the "Show all" control. */
export const INITIAL_VISIBLE_RESULTS = 8;
