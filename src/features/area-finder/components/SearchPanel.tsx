import { useId, useState, type FormEvent } from 'react';
import {
  TbBuildingSkyscraper,
  TbCategory,
  TbChevronDown,
  TbLoader2,
  TbSparkles,
} from 'react-icons/tb';

import { groupCategories, isCategoryId, type CategoryId } from '@shared/area-analysis/catalog';
import type { AreaAnalysisRequest } from '@shared/area-analysis/contracts';
import { cn } from '@/utils/cn';
import { CityChip } from './EmptyState';

export interface SearchValues {
  categoryId: CategoryId | '';
  city: string;
}

interface SearchPanelProps {
  values: SearchValues;
  onChange: (values: SearchValues) => void;
  onSubmit: (request: AreaAnalysisRequest) => void;
  busy: boolean;
  /** Cities the data source covers, offered as suggestions. May be empty. */
  suggestedCities: string[];
  /** True when any city can be typed; the suggestions are then just examples. */
  openEnded?: boolean;
  className?: string;
}

type FieldErrors = Partial<Record<'categoryId' | 'city', string>>;

const CATEGORY_GROUPS = groupCategories();
const CITY_MIN_LENGTH = 2;
const CITY_MAX_LENGTH = 60;

const LABEL = 'mb-1.5 block text-sm font-medium text-gray-700';
const CONTROL =
  'h-12 w-full rounded-lg border bg-white text-sm text-gray-900 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500';
const ICON = 'pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400';

export function SearchPanel({
  values,
  onChange,
  onSubmit,
  busy,
  suggestedCities,
  openEnded = false,
  className,
}: SearchPanelProps) {
  const id = useId();
  const categoryFieldId = `${id}-category`;
  const cityFieldId = `${id}-city`;
  const cityListId = `${id}-cities`;

  const [errors, setErrors] = useState<FieldErrors>({});

  const setCategory = (raw: string) => {
    onChange({ ...values, categoryId: isCategoryId(raw) ? raw : '' });
    if (errors.categoryId) setErrors((current) => ({ ...current, categoryId: undefined }));
  };

  const setCity = (city: string) => {
    onChange({ ...values, city });
    if (errors.city) setErrors((current) => ({ ...current, city: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    const city = values.city.trim().replace(/\s+/g, ' ');
    const next: FieldErrors = {};
    if (!values.categoryId) next.categoryId = 'Choose a business category.';
    if (city.length < CITY_MIN_LENGTH) {
      next.city = city ? `Enter at least ${CITY_MIN_LENGTH} characters.` : 'Enter a city.';
    }
    setErrors(next);

    if (!values.categoryId || next.city) return;
    onSubmit({ categoryId: values.categoryId, city });
  };

  const currentCity = values.city.trim().toLowerCase();

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-busy={busy}
      className={cn('rounded-2xl border border-gray-100 bg-white p-5 shadow-lg sm:p-6', className)}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-start">
        <div>
          <label htmlFor={categoryFieldId} className={LABEL}>
            Business category
          </label>
          <div className="relative">
            <TbCategory aria-hidden="true" className={ICON} />
            <select
              id={categoryFieldId}
              value={values.categoryId}
              onChange={(event) => setCategory(event.target.value)}
              aria-invalid={Boolean(errors.categoryId)}
              aria-describedby={errors.categoryId ? `${categoryFieldId}-error` : undefined}
              className={cn(
                CONTROL,
                'appearance-none pl-11 pr-10',
                errors.categoryId ? 'border-red-400' : 'border-gray-200 hover:border-gray-300',
                !values.categoryId && 'text-gray-400',
              )}
            >
              <option value="">Select a category</option>
              {CATEGORY_GROUPS.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <TbChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
          </div>
          <FieldError id={`${categoryFieldId}-error`} message={errors.categoryId} />
        </div>

        <div>
          <label htmlFor={cityFieldId} className={LABEL}>
            City
          </label>
          <div className="relative">
            <TbBuildingSkyscraper aria-hidden="true" className={ICON} />
            <input
              id={cityFieldId}
              type="text"
              list={cityListId}
              value={values.city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="e.g. Hyderabad"
              autoComplete="off"
              autoCapitalize="words"
              spellCheck={false}
              maxLength={CITY_MAX_LENGTH}
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? `${cityFieldId}-error` : undefined}
              className={cn(
                CONTROL,
                'pl-11 pr-4 placeholder:text-gray-400',
                errors.city ? 'border-red-400' : 'border-gray-200 hover:border-gray-300',
              )}
            />
            <datalist id={cityListId}>
              {suggestedCities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>
          <FieldError id={`${cityFieldId}-error`} message={errors.city} />
        </div>

        {/* Top padding matches the label height so the button lines up with the inputs. */}
        <div className="md:pt-[26px]">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 text-sm font-bold text-white transition-colors duration-150 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {busy ? (
              <TbLoader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
            ) : (
              <TbSparkles aria-hidden="true" className="h-5 w-5" />
            )}
            {busy ? 'Analysing' : 'Find Areas'}
          </button>
        </div>
      </div>

      {suggestedCities.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">
            {openEnded ? 'Try a city:' : 'Cities with coverage:'}
          </span>
          {suggestedCities.map((city) => (
            <CityChip
              key={city}
              city={city}
              selected={currentCity === city.toLowerCase()}
              onClick={() => setCity(city)}
            />
          ))}
        </div>
      ) : null}
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}
