import { useEffect, useRef, useState } from 'react';

import { Container } from '@/components/Container';
import { AppShell } from './components/AppShell';
import { ResultsSection } from './components/ResultsSection';
import { SearchPanel, type SearchValues } from './components/SearchPanel';
import { useAreaAnalysis } from './hooks/useAreaAnalysis';
import { useCoveredCities } from './hooks/useCoveredCities';
import { useDocumentMeta } from './hooks/useDocumentMeta';

/**
 * Business category -> city -> Find Areas -> ranked recommendations.
 *
 * All state lives here: the form values (so suggestion chips elsewhere on the
 * page can fill the city), the analysis lifecycle, and the coverage lookup.
 */
export default function AreaFinderPage() {
  useDocumentMeta();

  const [values, setValues] = useState<SearchValues>({ categoryId: '', city: '' });
  const analysis = useAreaAnalysis();
  const coverage = useCoveredCities();
  const resultsRef = useRef<HTMLDivElement>(null);

  const { status } = analysis.state;

  // Bring the results area into view as soon as an analysis starts.
  useEffect(() => {
    if (status === 'loading') {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status]);

  const pickCity = (city: string) => {
    setValues((current) => ({ ...current, city }));
    if (values.categoryId) analysis.run({ categoryId: values.categoryId, city });
  };

  return (
    <AppShell dataSource={coverage.dataSource}>
      <section className="border-b border-gray-100 bg-gradient-to-b from-blue-50 via-white to-gray-50">
        <Container className="py-12 lg:py-16">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-700">
              AI-powered area recommendations
            </p>
            <h1 className="text-3xl font-bold leading-tight text-navy sm:text-4xl lg:text-5xl">
              Find the best areas for your next campaign
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
              Choose a business category and a city. Every locality is scored on audience fit,
              activity, growth and competition, then ranked so you know where a campaign is most
              likely to land.
            </p>
          </div>

          <SearchPanel
            className="mt-8"
            values={values}
            onChange={setValues}
            onSubmit={analysis.run}
            busy={status === 'loading'}
            suggestedCities={coverage.cities}
            openEnded={coverage.dataSource?.acceptsAnyCity ?? false}
          />
        </Container>
      </section>

      <div ref={resultsRef} className="scroll-mt-16">
        <ResultsSection
          state={analysis.state}
          dataSource={coverage.dataSource}
          onRetry={analysis.retry}
          onPickCity={pickCity}
        />
      </div>
    </AppShell>
  );
}
