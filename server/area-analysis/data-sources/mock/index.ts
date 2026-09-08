/**
 * Sample data source.
 *
 * Serves the illustrative dataset in `./data/`. It exists for offline
 * development, demos and tests, and is reported to the UI as `isSample: true`
 * with every signal marked as sample data, so results are never mistaken for
 * real measurements. Select it with `AREA_DATA_SOURCE=mock`.
 *
 * An optional artificial latency mimics a network round-trip so the UI's
 * loading state is exercised in development.
 */

import type {
  SignalCoverage,
  SignalName,
} from '../../../../shared/area-analysis/contracts.ts';
import { normalizeCityName } from '../../utils/normalize-city.ts';
import type { AreaDataSource, CityAreas } from '../types.ts';
import { MOCK_CITIES } from './data/index.ts';
import type { MockCity } from './types.ts';

export interface MockAreaDataSourceOptions {
  /** Delay added to every lookup, in milliseconds. Defaults to 0. */
  latencyMs?: number;
}

const SIGNALS: SignalName[] = [
  'population',
  'footfall',
  'affluence',
  'youngProfessionals',
  'families',
  'students',
  'growth',
  'competition',
];

const SAMPLE_COVERAGE: SignalCoverage[] = SIGNALS.map((signal) => ({
  signal,
  provenance: 'sample',
  source: 'Sample dataset',
  method: 'Hand-written illustrative index, not a measurement',
}));

export function createMockAreaDataSource(options: MockAreaDataSourceOptions = {}): AreaDataSource {
  const latencyMs = Math.max(0, options.latencyMs ?? 0);

  const byKey = new Map<string, MockCity>();
  for (const city of MOCK_CITIES) {
    for (const alias of [city.name, ...city.aliases]) {
      byKey.set(normalizeCityName(alias), city);
    }
  }

  return {
    info: { id: 'mock', label: 'Sample dataset', isSample: true, acceptsAnyCity: false },

    async listCities() {
      return MOCK_CITIES.map((city) => city.name);
    },

    async getCityAreas(cityQuery: string): Promise<CityAreas | null> {
      if (latencyMs > 0) await sleep(latencyMs);
      const city = byKey.get(normalizeCityName(cityQuery));
      return city ? { city: city.name, areas: city.areas, coverage: SAMPLE_COVERAGE } : null;
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
