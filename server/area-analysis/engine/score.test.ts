import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BUSINESS_CATEGORIES } from '../../../shared/area-analysis/catalog.ts';
import { potentialFromScore } from '../../../shared/area-analysis/contracts.ts';
import { MOCK_CITIES } from '../data-sources/mock/data/index.ts';
import type { AreaSignals } from '../data-sources/types.ts';
import { CATEGORY_PROFILES } from './category-profiles.ts';
import { rankScoredAreas, scoreArea } from './score.ts';

const gym = CATEGORY_PROFILES.gym;

const baseline: AreaSignals = {
  id: 'base',
  name: 'Baseline',
  traits: [],
  population: 60,
  footfall: 60,
  affluence: 60,
  youngProfessionals: 60,
  families: 60,
  students: 60,
  growth: 60,
  competition: {
    fitness: 40,
    food: 40,
    education: 40,
    healthcare: 40,
    retail: 40,
    beauty: 40,
    services: 40,
  },
};

describe('scoreArea', () => {
  it('keeps every score and breakdown value within 0-100 across the whole sample dataset', () => {
    for (const category of BUSINESS_CATEGORIES) {
      for (const city of MOCK_CITIES) {
        for (const area of city.areas) {
          const { score, breakdown } = scoreArea(CATEGORY_PROFILES[category.id], area);
          assert.ok(
            Number.isInteger(score) && score >= 0 && score <= 100,
            `${category.id}/${city.name}/${area.id} produced score ${score}`,
          );
          for (const [component, value] of Object.entries(breakdown)) {
            assert.ok(value >= 0 && value <= 100, `${component} out of range: ${value}`);
          }
        }
      }
    }
  });

  it('rewards a better audience match', () => {
    const better = { ...baseline, youngProfessionals: 95 };
    assert.ok(scoreArea(gym, better).score > scoreArea(gym, baseline).score);
  });

  it('penalises competition above the baseline, scaled by sensitivity', () => {
    const crowded = { ...baseline, competition: { ...baseline.competition, fitness: 95 } };
    assert.ok(scoreArea(gym, crowded).score < scoreArea(gym, baseline).score);

    const indifferent = { ...gym, competitionSensitivity: 0 };
    assert.equal(scoreArea(indifferent, crowded).score, scoreArea(indifferent, baseline).score);
  });

  it('does not penalise competition at or below the baseline', () => {
    const quiet = { ...baseline, competition: { ...baseline.competition, fitness: 10 } };
    const normal = { ...baseline, competition: { ...baseline.competition, fitness: 50 } };
    assert.equal(scoreArea(gym, quiet).score, scoreArea(gym, normal).score);
    assert.equal(scoreArea(gym, quiet).competitionPenalty, 0);
  });

  it('reaches 100 for a perfect locality and reports white space correctly', () => {
    const perfect: AreaSignals = {
      ...baseline,
      population: 100,
      footfall: 100,
      affluence: 100,
      youngProfessionals: 100,
      families: 100,
      students: 100,
      growth: 100,
      competition: { ...baseline.competition, fitness: 0 },
    };
    const result = scoreArea(gym, perfect);
    assert.equal(result.score, 100);
    assert.equal(result.breakdown.whiteSpace, 100);
  });
});

describe('scoreArea with partial signals', () => {
  it('re-normalises over the signals a data source provides', () => {
    const partial: AreaSignals = {
      id: 'partial',
      name: 'Partial',
      traits: [],
      footfall: 80,
      youngProfessionals: 90,
      families: 40,
      students: 30,
      competition: { ...baseline.competition },
    };

    const result = scoreArea(gym, partial);
    assert.equal(result.breakdown.growth, null, 'growth was not supplied');
    // Affluence is missing, so audience fit averages the other three weights.
    assert.equal(result.breakdown.audienceFit, Math.round((90 + 0.3 * 40 + 0.4 * 30) / 1.7));
    assert.equal(result.breakdown.activity, 80, 'population is missing, so activity is footfall alone');
    assert.ok(result.score >= 0 && result.score <= 100);
  });

  it('treats demand as neutral when a source supplies competition only', () => {
    const competitionOnly: AreaSignals = {
      id: 'c',
      name: 'Competition only',
      traits: [],
      competition: { ...baseline.competition, fitness: 40 },
    };

    const result = scoreArea(gym, competitionOnly);
    assert.equal(result.breakdown.audienceFit, null);
    assert.equal(result.breakdown.activity, null);
    assert.equal(result.breakdown.growth, null);
    assert.equal(result.breakdown.whiteSpace, 60);
    assert.equal(result.score, 50);
  });
});

describe('rankScoredAreas', () => {
  it('orders best-first and breaks ties by name without mutating the input', () => {
    const a = scoreArea(gym, { ...baseline, id: 'a', name: 'Zeta' });
    const b = scoreArea(gym, { ...baseline, id: 'b', name: 'Alpha' });
    const c = scoreArea(gym, { ...baseline, id: 'c', name: 'Mid', youngProfessionals: 95 });
    const input = [a, b, c];

    const ranked = rankScoredAreas(input);

    assert.deepEqual(
      ranked.map((s) => s.area.id),
      ['c', 'b', 'a'],
    );
    assert.deepEqual(
      input.map((s) => s.area.id),
      ['a', 'b', 'c'],
    );
  });
});

describe('potentialFromScore', () => {
  it('maps scores to levels at the documented thresholds', () => {
    assert.equal(potentialFromScore(100), 'high');
    assert.equal(potentialFromScore(75), 'high');
    assert.equal(potentialFromScore(74), 'medium');
    assert.equal(potentialFromScore(55), 'medium');
    assert.equal(potentialFromScore(54), 'low');
    assert.equal(potentialFromScore(0), 'low');
  });
});
