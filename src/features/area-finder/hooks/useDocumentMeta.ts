import { useEffect } from 'react';
import { APP } from '../config';

/**
 * Sets the document title for the tool and keeps the route out of search
 * engines: it is an internal tool that happens to share the clinic's origin.
 * Restores the previous values on unmount so the clinic pages are unaffected.
 */
export function useDocumentMeta(): void {
  useEffect(() => {
    const previousTitle = document.title;
    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobots = robots?.getAttribute('content') ?? null;

    document.title = `${APP.name} | ${APP.tagline}`;
    robots?.setAttribute('content', 'noindex, nofollow');

    return () => {
      document.title = previousTitle;
      if (robots && previousRobots !== null) robots.setAttribute('content', previousRobots);
    };
  }, []);
}
