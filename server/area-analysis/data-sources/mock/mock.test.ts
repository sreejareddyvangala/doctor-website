import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { normalizeCityName } from '../../utils/normalize-city.ts';
import { COMPETITION_KEYS } from '../types.ts';
import { MOCK_CITIES } from './data/index.ts';
import { createMockAreaDataSource } from './index.ts';

const source = createMockAreaDataSource();

describe('normalizeCityName', () => {
  it('ignores case, accents, punctuation and surrounding whitespace', () => {
    assert.equal(normalizeCityName('  Bengalúru '), 'bengaluru');
    assert.equal(normalizeCityName('Navi-Mumbai'), 'navi mumbai');
    assert.equal(normalizeCityName('T.  NAGAR'), 't nagar');
  });
});

describe('mock data source', () => {
  it('resolves canonical names, aliases and messy input', async () => {
    const cases: Array<[string, string]> = [
      ['Hyderabad', 'Hyderabad'],
      ['HYD', 'Hyderabad'],
      ['  bangalore ', 'Bengaluru'],
      ['Bombay', 'Mumbai'],
      ['madras', 'Chennai'],
      ['Poona', 'Pune'],
    ];
    for (const [input, expected] of cases) {
      const result = await source.getCityAreas(input);
      assert.equal(result?.city, expected, `input "${input}"`);
    }
  });

  it('returns null for cities outside the dataset', async () => {
    assert.equal(await source.getCityAreas('Atlantis'), null);
    assert.equal(await source.getCityAreas(''), null);
  });

  it('lists cities in display order and flags itself as sample data', async () => {
    const cities = await source.listCities();
    assert.equal(cities[0], 'Hyderabad');
    assert.equal(cities.length, MOCK_CITIES.length);
    assert.equal(source.info.isSample, true);
    assert.equal(source.info.acceptsAnyCity, false);
  });

  it('declares every signal as sample data', async () => {
    const result = await source.getCityAreas('Hyderabad');
    const coverage = result?.coverage ?? [];
    assert.equal(coverage.length, 8);
    assert.ok(coverage.every((entry) => entry.provenance === 'sample'));
  });

  it('ships internally consistent data', () => {
    const numericSignals = [
      'population',
      'footfall',
      'affluence',
      'youngProfessionals',
      'families',
      'students',
      'growth',
    ] as const;

    for (const city of MOCK_CITIES) {
      const ids = new Set<string>();
      for (const area of city.areas) {
        assert.ok(!ids.has(area.id), `${city.name}: duplicate area id "${area.id}"`);
        ids.add(area.id);
        assert.ok(area.traits.length > 0, `${city.name}/${area.id}: no traits`);

        for (const signal of numericSignals) {
          const value = area[signal];
          // The sample dataset must carry every signal, unlike real sources.
          assert.ok(
            typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100,
            `${city.name}/${area.id}: ${signal}=${String(value)}`,
          );
        }
        for (const key of COMPETITION_KEYS) {
          const value = area.competition[key];
          assert.ok(
            Number.isInteger(value) && value >= 0 && value <= 100,
            `${city.name}/${area.id}: competition.${key}=${value}`,
          );
        }
      }
    }
  });
});
