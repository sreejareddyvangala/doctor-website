/** Extra breathing room between the sticky header and the section heading. */
const SCROLL_GAP = 12;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Height of the sticky header, measured from the live element so the offset
 * stays correct across breakpoints (and if the header ever changes size).
 */
export function getHeaderOffset(): number {
  if (typeof document === 'undefined') return 0;

  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (header) return header.offsetHeight;

  // Fallback to the CSS custom property if the header has not mounted yet.
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-h');
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed * 16 : 80;
}

/**
 * Smooth-scrolls a section into view, compensating for the sticky header.
 * Returns false when the section does not exist on the current page, letting
 * callers fall back to route navigation.
 */
export function scrollToSection(sectionId: string): boolean {
  if (typeof document === 'undefined') return false;

  const element = document.getElementById(sectionId);
  if (!element) return false;

  const top = element.getBoundingClientRect().top + window.scrollY - getHeaderOffset() - SCROLL_GAP;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });

  return true;
}

export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/** Splits "/#about" into its route and section id. */
export function parseHashHref(href: string): { path: string; sectionId?: string } {
  const [path, sectionId] = href.split('#');
  return { path: path || '/', sectionId: sectionId || undefined };
}
