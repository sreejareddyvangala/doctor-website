import { useEffect, useState } from 'react';

import type { DataSourceInfo } from '@shared/area-analysis/contracts';
import { fetchCoveredCities, isAbortError } from '@/lib/area-analysis/client';

export interface CoverageState {
  cities: string[];
  dataSource: DataSourceInfo | null;
  status: 'loading' | 'ready' | 'unavailable';
}

/**
 * Loads the cities the current data source covers, for suggestions. Purely a
 * convenience: if the request fails the form still works with free text.
 */
export function useCoveredCities(): CoverageState {
  const [state, setState] = useState<CoverageState>({
    cities: [],
    dataSource: null,
    status: 'loading',
  });

  useEffect(() => {
    const controller = new AbortController();

    fetchCoveredCities({ signal: controller.signal })
      .then((response) => {
        setState({ cities: response.cities, dataSource: response.dataSource, status: 'ready' });
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setState({ cities: [], dataSource: null, status: 'unavailable' });
      });

    return () => controller.abort();
  }, []);

  return state;
}
