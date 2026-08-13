import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from '@/utils/scroll';

interface ScrollState {
  scrollTo?: string;
}

/**
 * On route change: jump to the top of the new page, unless navigation carried
 * a `scrollTo` section id (from a nav or footer link), or the URL has a hash.
 */
export function ScrollRestoration() {
  const { pathname, hash, state } = useLocation();

  useEffect(() => {
    const target = (state as ScrollState | null)?.scrollTo ?? hash.replace('#', '');

    if (target) {
      // Wait a frame so the incoming page has laid out before measuring.
      const frame = requestAnimationFrame(() => {
        if (!scrollToSection(target)) {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      });

      return () => cancelAnimationFrame(frame);
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash, state]);

  return null;
}
