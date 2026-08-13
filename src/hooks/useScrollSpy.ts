import { useEffect, useState } from 'react';
import { getHeaderOffset } from '@/utils/scroll';

/**
 * Tracks which section is currently in view and returns its id.
 *
 * Uses scroll position rather than IntersectionObserver because sections here
 * vary a lot in height: we want "the section the reader is currently inside",
 * which is simply the last section whose top has passed under the header.
 *
 * @param sectionIds Section ids in document order.
 * @param enabled    Pass false on routes that have no scrollspy sections.
 */
export function useScrollSpy(sectionIds: readonly string[], enabled = true): string {
  const [activeId, setActiveId] = useState<string>(() => sectionIds[0] ?? '');

  useEffect(() => {
    if (!enabled || sectionIds.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      const scrollY = window.scrollY;
      // Anything above this line counts as "already scrolled past".
      const line = scrollY + getHeaderOffset() + 24;

      // Bottom of the page: the final section can be too short to ever reach
      // the line, so pin it explicitly.
      const atBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 2;

      if (atBottom) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        return;
      }

      let current = sectionIds[0];

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        if (element.getBoundingClientRect().top + scrollY <= line) {
          current = id;
        } else {
          break;
        }
      }

      setActiveId(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sectionIds, enabled]);

  return enabled ? activeId : '';
}
