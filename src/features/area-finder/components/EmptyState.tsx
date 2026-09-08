import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  /** Optional actions rendered under the description, e.g. city chips. */
  children?: ReactNode;
}

export function EmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 px-6 py-12 text-center sm:py-16">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
        {icon}
      </span>
      <h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">{description}</p>
      {children ? <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}

interface CityChipProps {
  city: string;
  /** When given, the chip reflects whether it matches the current input. */
  selected?: boolean;
  onClick: () => void;
}

export function CityChip({ city, selected, onClick }: CityChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150',
        selected
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-700',
      )}
    >
      {city}
    </button>
  );
}
