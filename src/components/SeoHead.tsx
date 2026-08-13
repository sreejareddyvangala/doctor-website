import { useEffect } from 'react';
import { doctor, seo } from '@/data/site';

interface SeoHeadProps {
  title?: string;
  description?: string;
}

const setMeta = (selector: string, attribute: string, content: string) => {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.setAttribute(attribute, content);
};

/**
 * Per-route document title and description. Kept as a tiny effect rather than
 * pulling in a helmet library for what amounts to three DOM writes.
 */
export function SeoHead({ title, description }: SeoHeadProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${doctor.name}` : seo.title;
    const desc = description ?? seo.description;

    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', desc);
  }, [title, description]);

  return null;
}
