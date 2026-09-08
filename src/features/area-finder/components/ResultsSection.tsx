import { TbCompass, TbTargetArrow } from 'react-icons/tb';

import type { DataSourceInfo } from '@shared/area-analysis/contracts';
import { Container } from '@/components/Container';
import type { AnalysisState } from '../hooks/useAreaAnalysis';
import { CityChip, EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import { ResultsList } from './ResultsList';

interface ResultsSectionProps {
  state: AnalysisState;
  /** Null until the coverage request resolves. */
  dataSource: DataSourceInfo | null;
  onRetry: () => void;
  /** Runs the analysis again for a suggested city. */
  onPickCity: (city: string) => void;
}

/** Renders whichever of idle / loading / error / empty / results applies. */
export function ResultsSection({ state, dataSource, onRetry, onPickCity }: ResultsSectionProps) {
  return (
    <section aria-label="Results" className="py-10 lg:py-14">
      <Container>{renderState(state, dataSource, onRetry, onPickCity)}</Container>
    </section>
  );
}

function renderState(
  state: AnalysisState,
  dataSource: DataSourceInfo | null,
  onRetry: () => void,
  onPickCity: (city: string) => void,
) {
  switch (state.status) {
    case 'idle':
      return (
        <EmptyState
          icon={<TbTargetArrow aria-hidden="true" className="h-7 w-7" />}
          title="Your recommendations will appear here"
          description="Pick a business category and a city above, then click Find Areas to rank the localities with the strongest opportunity."
        />
      );

    case 'loading':
      return (
        <LoadingState
          request={state.request}
          slowHint={
            dataSource && !dataSource.isSample
              ? `The first analysis of a city downloads ${dataSource.label} data and can take up to a minute. Later runs for the same city are much faster.`
              : undefined
          }
        />
      );

    case 'error':
      return <ErrorState error={state.error} onRetry={onRetry} />;

    case 'success': {
      const { response } = state;

      if (response.status === 'no_coverage') {
        const openEnded = response.dataSource.acceptsAnyCity === true;
        const reason =
          response.reason ??
          `The current data source (${response.dataSource.label}) does not include this city.`;
        const suggestion =
          response.availableCities.length === 0
            ? ''
            : openEnded
              ? ' Or try one of these:'
              : ' Try one of the covered cities:';

        return (
          <EmptyState
            icon={<TbCompass aria-hidden="true" className="h-7 w-7" />}
            title={
              openEnded
                ? `We couldn't find "${response.query.city}"`
                : `No coverage for "${response.query.city}" yet`
            }
            description={`${reason}${suggestion}`}
          >
            {response.availableCities.map((city) => (
              <CityChip key={city} city={city} onClick={() => onPickCity(city)} />
            ))}
          </EmptyState>
        );
      }

      if (response.results.length === 0) {
        return (
          <EmptyState
            icon={<TbCompass aria-hidden="true" className="h-7 w-7" />}
            title="No areas to rank"
            description={
              response.notes && response.notes.length > 0
                ? response.notes.join(' ')
                : `The data source returned no localities for ${response.query.city}.`
            }
          />
        );
      }

      return <ResultsList key={response.analyzedAt} response={response} />;
    }
  }
}
