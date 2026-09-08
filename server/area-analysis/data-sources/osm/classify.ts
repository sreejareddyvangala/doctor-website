/**
 * Maps OpenStreetMap tags to the engine's competition buckets and to the
 * counters behind the proxy signals. Pure and table-driven so the mapping is
 * easy to audit and extend.
 */

import type { CompetitionKey } from '../types.ts';
import type { PoiClass } from './types.ts';

const FOOD_AMENITIES = new Set([
  'restaurant',
  'cafe',
  'fast_food',
  'food_court',
  'ice_cream',
  'bar',
  'pub',
  'juice_bar',
]);
const FOOD_SHOPS = new Set(['bakery', 'confectionery', 'pastry', 'coffee', 'tea', 'deli', 'chocolate']);

const EDUCATION_AMENITIES = new Set([
  'school',
  'college',
  'university',
  'kindergarten',
  'language_school',
  'music_school',
  'training',
  'prep_school',
]);

const HEALTH_AMENITIES = new Set(['hospital', 'clinic', 'doctors', 'dentist', 'pharmacy']);
const HEALTH_SHOPS = new Set(['chemist', 'medical_supply', 'optician', 'hearing_aids']);

const BEAUTY_SHOPS = new Set([
  'beauty',
  'hairdresser',
  'cosmetics',
  'massage',
  'tattoo',
  'perfumery',
  'nails',
]);

const SERVICE_AMENITIES = new Set(['coworking_space', 'veterinary', 'animal_boarding']);
const SERVICE_SHOPS = new Set([
  'laundry',
  'dry_cleaning',
  'pet',
  'pet_grooming',
  'copyshop',
  'tailor',
  'photo',
]);

const FITNESS_LEISURE = new Set(['fitness_centre', 'sports_centre']);
const FITNESS_SPORTS = new Set(['yoga', 'fitness', 'pilates']);

/** `shop=*` values that are not an operating business. */
const NON_BUSINESS_SHOPS = new Set(['no', 'vacant', 'disused', 'empty']);

/**
 * Returns what a mapped place contributes, or `null` when it matches none of
 * the tags this source cares about.
 */
export function classifyPoi(tags: Record<string, string>): PoiClass | null {
  const buckets = new Set<CompetitionKey>();
  const { shop, amenity, leisure, office, sport } = tags;

  if (shop && !NON_BUSINESS_SHOPS.has(shop)) {
    if (FOOD_SHOPS.has(shop)) buckets.add('food');
    else if (HEALTH_SHOPS.has(shop)) buckets.add('healthcare');
    else if (BEAUTY_SHOPS.has(shop)) buckets.add('beauty');
    else if (SERVICE_SHOPS.has(shop)) buckets.add('services');
    else buckets.add('retail');
  }

  if (amenity) {
    if (FOOD_AMENITIES.has(amenity)) buckets.add('food');
    if (EDUCATION_AMENITIES.has(amenity)) buckets.add('education');
    if (HEALTH_AMENITIES.has(amenity)) buckets.add('healthcare');
    if (SERVICE_AMENITIES.has(amenity)) buckets.add('services');
    if (amenity === 'gym') buckets.add('fitness');
    if (amenity === 'spa') buckets.add('beauty');
  }

  if (tags.healthcare) buckets.add('healthcare');
  if (leisure && FITNESS_LEISURE.has(leisure)) buckets.add('fitness');
  if (sport && FITNESS_SPORTS.has(sport)) buckets.add('fitness');
  if (office === 'coworking') buckets.add('services');
  if (office === 'educational_institution') buckets.add('education');

  const kind: PoiClass = {
    buckets: [...buckets],
    office: Boolean(office) || tags.building === 'office',
    higherEducation: amenity === 'college' || amenity === 'university',
    dormitory: tags.building === 'dormitory' || amenity === 'dormitory',
    school: amenity === 'school' || amenity === 'kindergarten',
    playground: leisure === 'playground',
    transit:
      tags.railway === 'station' ||
      tags.public_transport === 'station' ||
      amenity === 'bus_station',
    mall: shop === 'mall',
  };

  const relevant =
    kind.buckets.length > 0 ||
    kind.office ||
    kind.higherEducation ||
    kind.dormitory ||
    kind.school ||
    kind.playground ||
    kind.transit ||
    kind.mall;

  return relevant ? kind : null;
}
