import { useCallback, useEffect, useRef, useState } from 'react';

import type { AreaAnalysisRequest, AreaAnalysisResponse } from '@shared/area-analysis/contracts';
import { analyzeAreas, toApiError, type AreaAnalysisApiError } from '@/lib/area-analysis/client';

export type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading'; request: AreaAnalysisRequest }
  | { status: 'success'; request: AreaAnalysisRequest; response: AreaAnalysisResponse }
  | { status: 'error'; request: AreaAnalysisRequest; error: AreaAnalysisApiError };

export interface AreaAnalysisController {
  state: AnalysisState;
  run: (request: AreaAnalysisRequest) => void;
  /** Re-runs the most recent request, if there was one. */
  retry: () => void;
  reset: () => void;
}

/**
 * Owns one in-flight analysis at a time. Starting a new one aborts the
 * previous request, so a slow response can never overwrite a newer result.
 */
export function useAreaAnalysis(): AreaAnalysisController {
  const [state, setState] = useState<AnalysisState>({ status: 'idle' });
  const controllerRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<AreaAnalysisRequest | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = useCallback((request: AreaAnalysisRequest) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    lastRequestRef.current = request;

    setState({ status: 'loading', request });

    analyzeAreas(request, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        setState({ status: 'success', request, response });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', request, error: toApiError(error) });
      });
  }, []);

  const retry = useCallback(() => {
    if (lastRequestRef.current) run(lastRequestRef.current);
  }, [run]);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState({ status: 'idle' });
  }, []);

  return { state, run, retry, reset };
}
