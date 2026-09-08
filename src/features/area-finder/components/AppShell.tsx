import type { ReactNode } from 'react';

import type { DataSourceInfo } from '@shared/area-analysis/contracts';
import { Container } from '@/components/Container';
import { APP } from '../config';
import { BrandMark } from './BrandMark';
import { Attribution, DataSourceBadge } from './DataSourceBadge';

interface AppShellProps {
  /** Null until the coverage request resolves. */
  dataSource: DataSourceInfo | null;
  children: ReactNode;
}

/** The tool's own chrome: brand header, main region and a short footer. */
export function AppShell({ dataSource, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <a href="#area-finder-main" className="skip-link">
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <BrandMark />
          {dataSource ? <DataSourceBadge dataSource={dataSource} /> : null}
        </Container>
      </header>

      <main id="area-finder-main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <Container className="flex flex-col gap-2 py-6 text-xs leading-relaxed text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {APP.name}. Recommendations are indicative and should
            be validated with on-ground research.
          </p>
          {dataSource ? (
            <p className="sm:text-right">
              {dataSource.isSample
                ? 'Currently running on an illustrative sample dataset.'
                : `Data source: ${dataSource.label}.`}
              {dataSource.attribution ? (
                <>
                  {' '}
                  <Attribution dataSource={dataSource} />
                </>
              ) : null}
            </p>
          ) : null}
        </Container>
      </footer>
    </div>
  );
}
