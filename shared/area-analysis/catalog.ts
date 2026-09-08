/**
 * Business categories a user can analyse.
 *
 * This is the product taxonomy and it is shared by the UI (the category
 * dropdown) and the analysis engine (one scoring profile per id, see
 * `server/area-analysis/engine/category-profiles.ts`). The profile table is
 * typed against `CategoryId`, so adding a category here without a profile,
 * or the other way round, is a compile error rather than a runtime surprise.
 *
 * This file is imported by both the browser bundle and the server: keep it
 * free of runtime dependencies.
 */

export const CATEGORY_GROUPS = [
  'Fitness & Wellness',
  'Food & Beverage',
  'Education',
  'Healthcare',
  'Retail',
  'Beauty & Personal Care',
  'Services',
] as const;

export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

export interface BusinessCategory {
  id: string;
  label: string;
  group: CategoryGroup;
}

export const BUSINESS_CATEGORIES = [
  { id: 'gym', label: 'Gym / Fitness Studio', group: 'Fitness & Wellness' },
  { id: 'yoga-studio', label: 'Yoga & Pilates Studio', group: 'Fitness & Wellness' },

  { id: 'cafe', label: 'Cafe / Coffee Shop', group: 'Food & Beverage' },
  { id: 'restaurant', label: 'Restaurant (Casual Dining)', group: 'Food & Beverage' },
  { id: 'cloud-kitchen', label: 'Cloud Kitchen / Food Delivery', group: 'Food & Beverage' },
  { id: 'bakery', label: 'Bakery & Desserts', group: 'Food & Beverage' },

  { id: 'coaching-institute', label: 'Coaching Institute / Tutoring', group: 'Education' },
  { id: 'preschool', label: 'Preschool & Daycare', group: 'Education' },

  { id: 'clinic', label: 'Clinic / Diagnostic Centre', group: 'Healthcare' },
  { id: 'dental-clinic', label: 'Dental Clinic', group: 'Healthcare' },
  { id: 'pharmacy', label: 'Pharmacy', group: 'Healthcare' },

  { id: 'supermarket', label: 'Grocery / Supermarket', group: 'Retail' },
  { id: 'apparel-store', label: 'Apparel & Fashion Store', group: 'Retail' },
  { id: 'electronics-store', label: 'Electronics & Mobile Store', group: 'Retail' },

  { id: 'salon', label: 'Salon & Beauty Studio', group: 'Beauty & Personal Care' },

  { id: 'coworking', label: 'Co-working Space', group: 'Services' },
  { id: 'pet-care', label: 'Pet Care & Grooming', group: 'Services' },
  { id: 'laundry', label: 'Laundry & Dry Cleaning', group: 'Services' },
] as const satisfies readonly BusinessCategory[];

export type CategoryId = (typeof BUSINESS_CATEGORIES)[number]['id'];

const CATEGORY_IDS: ReadonlySet<string> = new Set(BUSINESS_CATEGORIES.map((c) => c.id));

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && CATEGORY_IDS.has(value);
}

export function getCategory(id: CategoryId): BusinessCategory {
  const category = BUSINESS_CATEGORIES.find((c) => c.id === id);
  if (!category) throw new Error(`Unknown business category "${id}".`);
  return category;
}

/** Categories grouped for an optgroup-style dropdown, in catalog order. */
export function groupCategories(): Array<{ group: CategoryGroup; categories: BusinessCategory[] }> {
  return CATEGORY_GROUPS.map((group) => ({
    group,
    categories: BUSINESS_CATEGORIES.filter((c) => c.group === group),
  })).filter((entry) => entry.categories.length > 0);
}
