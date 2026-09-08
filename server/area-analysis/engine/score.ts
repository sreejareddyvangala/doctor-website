/**
 * The scoring model.
 *
 *   demand  = audience fit x mix.audience
 *           + activity     x mix.activity
 *           + growth       x mix.growth          (0-100)
 *   penalty = competition above the baseline, scaled by the category's
 *             sensitivity, up to MAX_COMPETITION_PENALTY points
 *   score   = calibrated(demand - penalty), clamped to 0-100
 *
 * A data source may not supply every signal. Missing signals are left out
 * and the remaining weights are re-normalised, so partial data narrows the
 * evidence rather than dragging a score towards zero.
 *
 * Deliberately transparent: every number that feeds the score is exposed in
 * the breakdown so the UI and the explanation layer can show their working.
 */

import type { ScoreBreakdown } from '../../../shared/area-analysis/contracts.ts';
import type { AreaSignals } from '../data-sources/types.ts';
import type { CategoryProfile } from './category-profiles.ts';

/** Competition density at or below this is normal for a city and not penalised. */
const COMPETITION_BASELINE = 50;

/** Points a fully saturated market removes from a maximally sensitive category. */
const MAX_COMPETITION_PENALTY = 15;

/** Demand assumed when a source supplies no demand signals at all. */
const NEUTRAL_DEMAND = 50;

/**
 * Raw composites cluster in the 50-85 band because every locality has some
 * demand. Stretching around the midpoint keeps the differences that matter
 * legible on a 0-100 scale. The transform is monotonic, so ranking is
 * unaffected; only the displayed spread changes.
 */
const SCORE_SPREAD = 1.3;

export interface ScoredArea {
  area: AreaSignals;
  /** Final opportunity score, 0-100, integer. */
  score: number;
  breakdown: ScoreBreakdown;
  /** Competition density that applied to this category, 0-100. */
  competition: number;
  /** Points actually removed for competition. */
  competitionPenalty: number;
}

export function scoreArea(profile: CategoryProfile, area: AreaSignals): ScoredArea {
  const audienceFit = weightedAverage(profile.audience, area);
  const activity = weightedAverage(profile.activity, area);
  const growth = typeof area.growth === 'number' ? area.growth : null;
  const competition = area.competition[profile.competitionKey];
  const whiteSpace = 100 - competition;

  const components: Array<[weight: number, value: number | null]> = [
    [profile.mix.audience, audienceFit],
    [profile.mix.activity, activity],
    [profile.mix.growth, growth],
  ];
  let weightTotal = 0;
  let weightedSum = 0;
  for (const [weight, value] of components) {
    if (value === null) continue;
    weightTotal += weight;
    weightedSum += weight * value;
  }
  const demand = weightTotal > 0 ? weightedSum / weightTotal : NEUTRAL_DEMAND;

  const excess = Math.max(0, competition - COMPETITION_BASELINE) / (100 - COMPETITION_BASELINE);
  const competitionPenalty = excess * MAX_COMPETITION_PENALTY * profile.competitionSensitivity;

  const raw = demand - competitionPenalty;
  const score = clamp(Math.round(50 + (raw - 50) * SCORE_SPREAD), 0, 100);

  return {
    area,
    score,
    competition,
    competitionPenalty,
    breakdown: {
      audienceFit: roundOrNull(audienceFit),
      activity: roundOrNull(activity),
      growth: roundOrNull(growth),
      whiteSpace: Math.round(whiteSpace),
    },
  };
}

/** Ranks best-first; ties break alphabetically so output is deterministic. */
export function rankScoredAreas(scored: ScoredArea[]): ScoredArea[] {
  return [...scored].sort(
    (a, b) => b.score - a.score || a.area.name.localeCompare(b.area.name, 'en'),
  );
}

/**
 * Weighted mean over the signals the area actually carries. Returns `null`
 * when none of the weighted signals is present.
 */
function weightedAverage<K extends keyof AreaSignals>(
  weights: Record<K, number>,
  area: AreaSignals,
): number | null {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const key of Object.keys(weights) as K[]) {
    const value = area[key];
    if (typeof value !== 'number') continue;
    totalWeight += weights[key];
    weightedSum += weights[key] * value;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : null;
}

function roundOrNull(value: number | null): number | null {
  return value === null ? null : Math.round(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
