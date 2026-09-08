import type { PotentialLevel } from '@shared/area-analysis/contracts';
import { cn } from '@/utils/cn';

/**
 * Semantic status colours for the three potential levels. Green / amber / gray
 * are used only here and in the score ring, never as brand accents.
 */
export const POTENTIAL_STYLES: Record<
  PotentialLevel,
  { label: string; short: string; className: string; dot: string }
> = {
  high: {
    label: 'High potential',
    short: 'High',
    className: 'bg-green-50 text-green-700 ring-green-200',
    dot: 'bg-green-500',
  },
  medium: {
    label: 'Medium potential',
    short: 'Medium',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Low potential',
    short: 'Low',
    className: 'bg-gray-100 text-gray-600 ring-gray-200',
    dot: 'bg-gray-400',
  },
};

interface PotentialBadgeProps {
  level: PotentialLevel;
  className?: string;
}

export function PotentialBadge({ level, className }: PotentialBadgeProps) {
  const style = POTENTIAL_STYLES[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
        style.className,
        className,
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {style.label}
    </span>
  );
}
