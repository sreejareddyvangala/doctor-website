/**
 * The analysis use case: signals in, ranked recommendations out.
 *
 * Pure orchestration. It knows nothing about HTTP, and everything with a
 * side effect (the data source, the explanation provider, the clock) is
 * injected so the whole flow is unit-testable and swappable.
 */

import { getCategory } from '../../shared/area-analysis/catalog.ts';
import {
  potentialFromScore,
  type AreaAnalysisRequest,
  type AreaAnalysisResponse,
  type AreaRecommendation,
} from '../../shared/area-analysis/contracts.ts';
import type { AreaDataSource } from './data-sources/types.ts';
import { CATEGORY_PROFILES } from './engine/category-profiles.ts';
import { ruleBasedExplanationProvider, type ExplanationProvider } from './engine/explain.ts';
import { rankScoredAreas, scoreArea } from './engine/score.ts';

export interface AnalysisDependencies {
  dataSource: AreaDataSource;
  /** Defaults to the rule-based provider. */
  explanations?: ExplanationProvider;
  /** Injectable clock for deterministic tests. */
  now?: () => Date;
}

export async function analyzeAreas(
  request: AreaAnalysisRequest,
  deps: AnalysisDependencies,
): Promise<AreaAnalysisResponse> {
  const category = getCategory(request.categoryId);
  const profile = CATEGORY_PROFILES[category.id as typeof request.categoryId];
  const explanations = deps.explanations ?? ruleBasedExplanationProvider;
  const now = deps.now ?? (() => new Date());
  const { info } = deps.dataSource;

  const cityAreas = await deps.dataSource.getCityAreas(request.city);
  if (!cityAreas) {
    return {
      status: 'no_coverage',
      query: { categoryId: request.categoryId, categoryLabel: category.label, city: request.city },
      availableCities: await deps.dataSource.listCities(),
      dataSource: info,
      reason:
        info.missingCityHint ?? `The current data source (${info.label}) does not include this city.`,
    };
  }

  const ranked = rankScoredAreas(cityAreas.areas.map((area) => scoreArea(profile, area)));

  const explained = await explanations.explain(
    ranked.map((scored) => ({
      area: scored.area,
      scored,
      profile,
      potential: potentialFromScore(scored.score),
      categoryLabel: category.label,
    })),
  );

  const results: AreaRecommendation[] = ranked.map((scored, index) => ({
    rank: index + 1,
    areaId: scored.area.id,
    areaName: scored.area.name,
    ...(scored.area.zone ? { zone: scored.area.zone } : {}),
    score: scored.score,
    potential: potentialFromScore(scored.score),
    explanation: explained[index]?.explanation ?? '',
    highlights: explained[index]?.highlights ?? [],
    breakdown: scored.breakdown,
  }));

  return {
    status: 'ok',
    query: { categoryId: request.categoryId, categoryLabel: category.label, city: cityAreas.city },
    results,
    totals: {
      analyzed: results.length,
      high: results.filter((r) => r.potential === 'high').length,
      medium: results.filter((r) => r.potential === 'medium').length,
      low: results.filter((r) => r.potential === 'low').length,
    },
    dataSource: info,
    analyzedAt: now().toISOString(),
    ...(cityAreas.coverage ? { coverage: cityAreas.coverage } : {}),
    ...(cityAreas.notes && cityAreas.notes.length > 0 ? { notes: cityAreas.notes } : {}),
    ...(cityAreas.skippedAreas ? { skippedAreas: cityAreas.skippedAreas } : {}),
  };
}
