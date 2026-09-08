import { useEffect, useRef, useState } from 'react';
import { TbChevronDown, TbChevronUp } from 'react-icons/tb';

import type { AreaAnalysisSuccess, PotentialLevel } from '@shared/area-analysis/contracts';
import { cn } from '@/utils/cn';
import { INITIAL_VISIBLE_RESULTS } from '../config';
import { AreaCard } from './AreaCard';
import { CoverageLegend } from './CoverageLegend';
import { Attribution, DataSourceBadge } from './DataSourceBadge';
import { POTENTIAL_STYLES } from './PotentialBadge';

interface ResultsListProps {
  response: AreaAnalysisSuccess;
}

/** Ranked results for one analysis. Mount with a `key` per run so "show all" resets. */
export function ResultsList({ response }: ResultsListProps) {
  const { query, results, totals, dataSource, coverage, notes } = response;
  const [showAll, setShowAll] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move keyboard and screen-reader focus to the new results.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const visible = showAll ? results : results.slice(0, INITIAL_VISIBLE_RESULTS);
  const hasMore = results.length > INITIAL_VISIBLE_RESULTS;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-blue-700">
            Recommended areas
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold text-gray-900 outline-none sm:text-3xl"
          >
            {query.categoryLabel} in {query.city}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {totals.analyzed} localities analysed and ranked by opportunity score.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TotalPill level="high" count={totals.high} />
          <TotalPill level="medium" count={totals.medium} />
          <TotalPill level="low" count={totals.low} />
          <DataSourceBadge dataSource={dataSource} />
        </div>
      </div>

      {coverage && coverage.length > 0 ? (
        <CoverageLegend coverage={coverage} className="mt-6" />
      ) : null}

      <ol className="mt-6 space-y-4">
        {visible.map((recommendation, index) => (
          <AreaCard key={recommendation.areaId} recommendation={recommendation} index={index} />
        ))}
      </ol>

      {hasMore ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors duration-150 hover:border-blue-300 hover:text-blue-700"
          >
            {showAll ? (
              <>
                Show top {INITIAL_VISIBLE_RESULTS}
                <TbChevronUp aria-hidden="true" className="h-4 w-4" />
              </>
            ) : (
              <>
                Show all {results.length} areas
                <TbChevronDown aria-hidden="true" className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      ) : null}

      <div className="mt-8 space-y-1.5 text-xs leading-relaxed text-gray-500">
        <p>
          Scores combine audience fit, activity, growth and competition for this category.
          {dataSource.isSample
            ? ' This run used an illustrative sample dataset; connect a real data source before acting on the numbers.'
            : ''}
        </p>
        {notes?.map((note) => (
          <p key={note}>{note}</p>
        ))}
        {dataSource.attribution ? (
          <p>
            <Attribution dataSource={dataSource} />
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TotalPill({ level, count }: { level: PotentialLevel; count: number }) {
  const style = POTENTIAL_STYLES[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1',
        style.className,
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {count} {style.short}
    </span>
  );
}
