/**
 * What each business category needs from a locality.
 *
 * A profile says which audience signals matter (and how much), whether the
 * business lives off residents or passers-by, how the demand components
 * combine, and how badly existing competitors hurt. The table is typed
 * against the shared catalog, so every category is guaranteed a profile.
 */

import type { CategoryId } from '../../../shared/area-analysis/catalog.ts';
import type { CompetitionKey } from '../data-sources/types.ts';

export const AUDIENCE_SIGNALS = ['affluence', 'youngProfessionals', 'families', 'students'] as const;
export type AudienceSignal = (typeof AUDIENCE_SIGNALS)[number];

export const ACTIVITY_SIGNALS = ['population', 'footfall'] as const;
export type ActivitySignal = (typeof ACTIVITY_SIGNALS)[number];

export interface CategoryProfile {
  /** Relative importance (0-1) of each audience signal for this business. */
  audience: Record<AudienceSignal, number>;
  /** Residents (population) versus visitors (footfall). Sums to 1. */
  activity: Record<ActivitySignal, number>;
  /** How the three demand components combine. Sums to 1. */
  mix: { audience: number; activity: number; growth: number };
  /** Which bucket of `AreaSignals.competition` applies. */
  competitionKey: CompetitionKey;
  /** 0 = clustering is harmless or helpful, 1 = every competitor hurts. */
  competitionSensitivity: number;
}

export const CATEGORY_PROFILES: Record<CategoryId, CategoryProfile> = {
  gym: {
    audience: { affluence: 0.8, youngProfessionals: 1, families: 0.3, students: 0.4 },
    activity: { population: 0.6, footfall: 0.4 },
    mix: { audience: 0.7, activity: 0.15, growth: 0.15 },
    competitionKey: 'fitness',
    competitionSensitivity: 1,
  },
  'yoga-studio': {
    audience: { affluence: 0.9, youngProfessionals: 0.8, families: 0.5, students: 0.2 },
    activity: { population: 0.6, footfall: 0.4 },
    mix: { audience: 0.7, activity: 0.15, growth: 0.15 },
    competitionKey: 'fitness',
    competitionSensitivity: 0.8,
  },

  cafe: {
    audience: { affluence: 0.7, youngProfessionals: 1, families: 0.2, students: 0.6 },
    activity: { population: 0.3, footfall: 0.7 },
    mix: { audience: 0.55, activity: 0.3, growth: 0.15 },
    competitionKey: 'food',
    competitionSensitivity: 0.4,
  },
  restaurant: {
    audience: { affluence: 0.8, youngProfessionals: 0.7, families: 0.7, students: 0.3 },
    activity: { population: 0.4, footfall: 0.6 },
    mix: { audience: 0.55, activity: 0.3, growth: 0.15 },
    competitionKey: 'food',
    competitionSensitivity: 0.5,
  },
  'cloud-kitchen': {
    audience: { affluence: 0.5, youngProfessionals: 1, families: 0.4, students: 0.6 },
    activity: { population: 0.8, footfall: 0.2 },
    mix: { audience: 0.65, activity: 0.25, growth: 0.1 },
    competitionKey: 'food',
    competitionSensitivity: 0.6,
  },
  bakery: {
    audience: { affluence: 0.7, youngProfessionals: 0.6, families: 0.8, students: 0.3 },
    activity: { population: 0.5, footfall: 0.5 },
    mix: { audience: 0.6, activity: 0.25, growth: 0.15 },
    competitionKey: 'food',
    competitionSensitivity: 0.5,
  },

  'coaching-institute': {
    audience: { affluence: 0.3, youngProfessionals: 0.2, families: 0.7, students: 1 },
    activity: { population: 0.5, footfall: 0.5 },
    mix: { audience: 0.7, activity: 0.2, growth: 0.1 },
    competitionKey: 'education',
    competitionSensitivity: 0.6,
  },
  preschool: {
    audience: { affluence: 0.6, youngProfessionals: 0.5, families: 1, students: 0 },
    activity: { population: 0.8, footfall: 0.2 },
    mix: { audience: 0.65, activity: 0.15, growth: 0.2 },
    competitionKey: 'education',
    competitionSensitivity: 0.8,
  },

  clinic: {
    audience: { affluence: 0.6, youngProfessionals: 0.4, families: 0.9, students: 0.2 },
    activity: { population: 0.7, footfall: 0.3 },
    mix: { audience: 0.6, activity: 0.25, growth: 0.15 },
    competitionKey: 'healthcare',
    competitionSensitivity: 0.7,
  },
  'dental-clinic': {
    audience: { affluence: 0.8, youngProfessionals: 0.5, families: 0.8, students: 0.2 },
    activity: { population: 0.6, footfall: 0.4 },
    mix: { audience: 0.6, activity: 0.25, growth: 0.15 },
    competitionKey: 'healthcare',
    competitionSensitivity: 0.8,
  },
  pharmacy: {
    audience: { affluence: 0.3, youngProfessionals: 0.3, families: 0.9, students: 0.3 },
    activity: { population: 0.7, footfall: 0.3 },
    mix: { audience: 0.5, activity: 0.35, growth: 0.15 },
    competitionKey: 'healthcare',
    competitionSensitivity: 0.9,
  },

  supermarket: {
    audience: { affluence: 0.4, youngProfessionals: 0.5, families: 1, students: 0.3 },
    activity: { population: 0.8, footfall: 0.2 },
    mix: { audience: 0.55, activity: 0.35, growth: 0.1 },
    competitionKey: 'retail',
    competitionSensitivity: 0.9,
  },
  'apparel-store': {
    audience: { affluence: 0.8, youngProfessionals: 0.8, families: 0.5, students: 0.5 },
    activity: { population: 0.3, footfall: 0.7 },
    mix: { audience: 0.5, activity: 0.35, growth: 0.15 },
    competitionKey: 'retail',
    competitionSensitivity: 0.4,
  },
  'electronics-store': {
    audience: { affluence: 0.6, youngProfessionals: 0.8, families: 0.5, students: 0.6 },
    activity: { population: 0.4, footfall: 0.6 },
    mix: { audience: 0.5, activity: 0.35, growth: 0.15 },
    competitionKey: 'retail',
    competitionSensitivity: 0.6,
  },

  salon: {
    audience: { affluence: 0.8, youngProfessionals: 0.8, families: 0.5, students: 0.4 },
    activity: { population: 0.6, footfall: 0.4 },
    mix: { audience: 0.65, activity: 0.2, growth: 0.15 },
    competitionKey: 'beauty',
    competitionSensitivity: 0.7,
  },

  coworking: {
    audience: { affluence: 0.6, youngProfessionals: 1, families: 0, students: 0.3 },
    activity: { population: 0.3, footfall: 0.7 },
    mix: { audience: 0.6, activity: 0.25, growth: 0.15 },
    competitionKey: 'services',
    competitionSensitivity: 0.7,
  },
  'pet-care': {
    audience: { affluence: 0.9, youngProfessionals: 0.6, families: 0.7, students: 0.1 },
    activity: { population: 0.7, footfall: 0.3 },
    mix: { audience: 0.65, activity: 0.15, growth: 0.2 },
    competitionKey: 'services',
    competitionSensitivity: 0.5,
  },
  laundry: {
    audience: { affluence: 0.6, youngProfessionals: 0.9, families: 0.4, students: 0.5 },
    activity: { population: 0.8, footfall: 0.2 },
    mix: { audience: 0.6, activity: 0.3, growth: 0.1 },
    competitionKey: 'services',
    competitionSensitivity: 0.8,
  },
};
