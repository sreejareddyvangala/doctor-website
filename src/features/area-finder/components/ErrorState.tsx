import { TbAlertTriangle, TbRefresh } from 'react-icons/tb';

import type { AreaAnalysisApiError } from '@/lib/area-analysis/client';

interface ErrorStateProps {
  error: AreaAnalysisApiError;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TbAlertTriangle aria-hidden="true" className="h-6 w-6" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-gray-900">Analysis failed</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{error.message}</p>

          {error.issues.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
              {error.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}

          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-blue-800"
          >
            <TbRefresh aria-hidden="true" className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
