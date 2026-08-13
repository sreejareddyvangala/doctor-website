import { Link } from 'react-router-dom';

import { Container } from '@/components/Container';
import { IconChevronRight } from '@/components/icons';

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
}

/**
 * Banner for standalone routes. Reuses the Rocket hero's green→teal→blue
 * gradient so inner pages read as part of the same site.
 */
export function PageHero({ eyebrow, title, description, crumbs = [] }: PageHeroProps) {
  return (
    <section className="border-b border-gray-100 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      <Container className="py-12 lg:py-16">
        {crumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
              <li>
                <Link to="/" className="font-medium transition-colors hover:text-blue-700">
                  Home
                </Link>
              </li>
              {crumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <IconChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  {crumb.to && index < crumbs.length - 1 ? (
                    <Link
                      to={crumb.to}
                      className="font-medium transition-colors hover:text-blue-700"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-semibold text-blue-700">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-700">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="text-3xl font-bold leading-tight text-navy sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          {description ? <p className="mt-4 leading-relaxed text-gray-600">{description}</p> : null}
        </div>
      </Container>
    </section>
  );
}
