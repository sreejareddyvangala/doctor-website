import { useEffect, useState } from 'react';
import { TbLoader2 } from 'react-icons/tb';

import { getCategory } from '@shared/area-analysis/catalog';
import type { AreaAnalysisRequest } from '@shared/area-analysis/contracts';

const STEPS = [
  'profiling the target audience',
  'scanning localities',
  'measuring competition',
  'ranking opportunities',
];
const STEP_INTERVAL_MS = 650;
/** Real data sources can be slow on a city's first run; say so before it feels broken. */
const SLOW_HINT_AFTER_MS = 6000;

interface LoadingStateProps {
  request: AreaAnalysisRequest;
  /** Shown after a few seconds to explain a long first fetch. */
  slowHint?: string;
}

export function LoadingState({ request, slowHint }: LoadingStateProps) {
  const [step, setStep] = useState(0);
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(
      () => setStep((current) => Math.min(current + 1, STEPS.length - 1)),
      STEP_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!slowHint) return undefined;
    const timer = window.setTimeout(() => setShowSlowHint(true), SLOW_HINT_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [slowHint]);

  const categoryLabel = getCategory(request.categoryId).label;

  return (
    <div>
      <p role="status" className="flex items-center gap-3 text-sm text-gray-600">
        <TbLoader2 aria-hidden="true" className="h-5 w-5 shrink-0 animate-spin text-blue-700" />
        <span>
          Analysing <strong className="font-semibold text-gray-900">{categoryLabel}</strong> in{' '}
          <strong className="font-semibold text-gray-900">{request.city}</strong>: {STEPS[step]}
          &hellip;
        </span>
      </p>
      {slowHint && showSlowHint ? (
        <p className="mt-2 pl-8 text-xs leading-relaxed text-gray-500">{slowHint}</p>
      ) : null}

      <ol className="mt-6 space-y-4" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <SkeletonCard key={index} />
        ))}
      </ol>
    </div>
  );
}

function SkeletonCard() {
  return (
    <li className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="h-9 w-9 shrink-0 rounded-full bg-gray-100" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-2/5 rounded bg-gray-100" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-4/5 rounded bg-gray-100" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 sm:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="h-1.5 rounded-full bg-gray-100" />
            ))}
          </div>
        </div>
        <div className="hidden h-[84px] w-[84px] shrink-0 rounded-full bg-gray-100 sm:block" />
      </div>
    </li>
  );
}
