/**
 * Turns a scored area into the "why" shown on its card.
 *
 * The provider interface is batched so a future implementation can produce
 * every explanation for a result set in one LLM call, with the rule-based
 * version here as the fallback. The rules read the same weights the score
 * used, so an explanation can never contradict the number next to it.
 */

import type { PotentialLevel } from '../../../shared/area-analysis/contracts.ts';
import type { AreaSignals, CompetitionKey } from '../data-sources/types.ts';
import {
  ACTIVITY_SIGNALS,
  AUDIENCE_SIGNALS,
  type ActivitySignal,
  type AudienceSignal,
  type CategoryProfile,
} from './category-profiles.ts';
import type { ScoredArea } from './score.ts';

export interface ExplanationInput {
  area: AreaSignals;
  scored: ScoredArea;
  profile: CategoryProfile;
  potential: PotentialLevel;
  /** Human-readable category, e.g. "Gym / Fitness Studio". */
  categoryLabel: string;
}

export interface Explanation {
  /** One or two plain-language sentences. */
  explanation: string;
  /** Short descriptive tags for the area. */
  highlights: string[];
}

export interface ExplanationProvider {
  explain(inputs: ExplanationInput[]): Promise<Explanation[]>;
}

export const ruleBasedExplanationProvider: ExplanationProvider = {
  async explain(inputs) {
    return inputs.map(explainOne);
  },
};

type SignalKey = AudienceSignal | ActivitySignal | 'growth';

interface SignalReading {
  key: SignalKey;
  value: number;
  /** Share of the final score this signal can move. All readings sum to 1. */
  importance: number;
}

const PHRASES: Record<SignalKey, { veryStrong: string; strong: string; weak: string }> = {
  youngProfessionals: {
    veryStrong: 'a large base of young working professionals',
    strong: 'a solid base of young professionals',
    weak: 'a thin base of young professionals',
  },
  affluence: {
    veryStrong: 'very high spending power',
    strong: 'above-average spending power',
    weak: 'lower spending power',
  },
  families: {
    veryStrong: 'a dense base of family households',
    strong: 'a strong family presence',
    weak: 'relatively few families',
  },
  students: {
    veryStrong: 'a large student population',
    strong: 'a sizeable student crowd',
    weak: 'few students',
  },
  population: {
    veryStrong: 'a very large resident population',
    strong: 'a large resident population',
    weak: 'a small resident base',
  },
  footfall: {
    veryStrong: 'heavy daily footfall',
    strong: 'steady daily footfall',
    weak: 'limited daily footfall',
  },
  growth: {
    veryStrong: 'rapid new development',
    strong: 'healthy ongoing development',
    weak: 'little new development',
  },
};

/** Plural nouns matching the competition buckets the data actually measures. */
const COMPETITOR_NOUNS: Record<CompetitionKey, string> = {
  fitness: 'gyms and fitness studios',
  food: 'cafes and restaurants',
  education: 'coaching centres and schools',
  healthcare: 'clinics and pharmacies',
  retail: 'retail stores',
  beauty: 'salons',
  services: 'similar service businesses',
};

const VERY_STRONG = 85;
const STRONG = 60;
const WEAK = 50;
/** Ignore signals that barely move the score, however extreme they are. */
const MIN_STRENGTH_IMPORTANCE = 0.08;
const MIN_WEAKNESS_IMPORTANCE = 0.15;

function explainOne(input: ExplanationInput): Explanation {
  const { area, profile, scored, potential } = input;
  const readings = readSignals(profile, area);

  const strengths = readings
    .filter((r) => r.value >= STRONG && r.importance >= MIN_STRENGTH_IMPORTANCE)
    .sort((a, b) => b.importance * b.value - a.importance * a.value)
    .slice(0, 2)
    .map((r) => (r.value >= VERY_STRONG ? PHRASES[r.key].veryStrong : PHRASES[r.key].strong));

  const weaknesses = readings
    .filter((r) => r.value < WEAK && r.importance >= MIN_WEAKNESS_IMPORTANCE)
    .sort((a, b) => b.importance * (100 - b.value) - a.importance * (100 - a.value))
    .slice(0, 2)
    .map((r) => PHRASES[r.key].weak);

  const competition = describeCompetition(scored.competition, profile);

  return {
    explanation: compose(area.name, potential, strengths, weaknesses, competition),
    highlights: area.traits.slice(0, 3),
  };
}

function readSignals(profile: CategoryProfile, area: AreaSignals): SignalReading[] {
  const audienceTotal = sum(Object.values(profile.audience)) || 1;
  const activityTotal = sum(Object.values(profile.activity)) || 1;
  const readings: SignalReading[] = [];

  // Signals the data source did not supply are simply not talked about.
  for (const key of AUDIENCE_SIGNALS) {
    const value = area[key];
    if (typeof value !== 'number') continue;
    readings.push({
      key,
      value,
      importance: profile.mix.audience * (profile.audience[key] / audienceTotal),
    });
  }
  for (const key of ACTIVITY_SIGNALS) {
    const value = area[key];
    if (typeof value !== 'number') continue;
    readings.push({
      key,
      value,
      importance: profile.mix.activity * (profile.activity[key] / activityTotal),
    });
  }
  if (typeof area.growth === 'number') {
    readings.push({ key: 'growth', value: area.growth, importance: profile.mix.growth });
  }

  return readings;
}

interface CompetitionRemark {
  /** Noun phrase that follows "has" or "faces". */
  phrase: string;
  /** True when competition is pulling the score down. */
  isDrag: boolean;
}

function describeCompetition(density: number, profile: CategoryProfile): CompetitionRemark {
  const noun = COMPETITOR_NOUNS[profile.competitionKey];

  if (density < 35) {
    return { phrase: `few existing ${noun}, leaving clear white space`, isDrag: false };
  }
  if (density < 60) {
    return {
      phrase: `moderate competition from existing ${noun}`,
      isDrag: density > 50 && profile.competitionSensitivity >= 0.5,
    };
  }
  if (profile.competitionSensitivity <= 0.5) {
    // Cafes, fashion and the like benefit from clustering: say so.
    return { phrase: `an established cluster of ${noun} that already draws customers`, isDrag: false };
  }
  if (density < 80) {
    return { phrase: `a crowded market of ${noun}`, isDrag: true };
  }
  return { phrase: `a saturated market of ${noun}`, isDrag: true };
}

function compose(
  name: string,
  potential: PotentialLevel,
  strengths: string[],
  weaknesses: string[],
  competition: CompetitionRemark,
): string {
  const [s1, s2] = strengths;
  const strengthText = s1 && s2 ? `${s1} and ${s2}` : s1;
  const weaknessText = weaknesses.join(' and ');
  const weaknessVerb = weaknesses.length > 1 ? 'hold' : 'holds';

  switch (potential) {
    case 'high': {
      if (!strengthText) {
        return `${name} scores well across the board and has ${competition.phrase}.`;
      }
      if (competition.isDrag) {
        return `${name} offers ${strengthText}, strong enough to stand out despite ${competition.phrase}.`;
      }
      return s2
        ? `${name} pairs ${s1} with ${s2}, and has ${competition.phrase}.`
        : `${name} offers ${s1}, and has ${competition.phrase}.`;
    }

    case 'medium': {
      const offer = strengthText ?? 'a reasonable audience match';
      if (weaknessText) {
        return `${name} offers ${offer}, but ${weaknessText} ${weaknessVerb} it back. It has ${competition.phrase}.`;
      }
      if (competition.isDrag) {
        return `${name} offers ${offer}, but faces ${competition.phrase}.`;
      }
      return `${name} offers ${offer}, with ${competition.phrase}. A solid secondary option rather than a top pick.`;
    }

    case 'low': {
      if (weaknessText) {
        const concession = strengthText ? `, although it does offer ${strengthText}` : '';
        const tail = competition.isDrag ? `It also faces ${competition.phrase}.` : `It has ${competition.phrase}.`;
        return `${name} has ${weaknessText}${concession}. ${tail}`;
      }
      if (strengthText) {
        return `${name} offers ${strengthText} but little else this category needs${competition.isDrag ? `, and faces ${competition.phrase}` : ''}.`;
      }
      return `${name} is a weak fit for this category${competition.isDrag ? ` and faces ${competition.phrase}` : ''}.`;
    }
  }
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
