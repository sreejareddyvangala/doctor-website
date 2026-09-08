import type { AreaRecommendation } from '@shared/area-analysis/contracts';
import { cn } from '@/utils/cn';
import { PotentialBadge } from './PotentialBadge';
import { ScoreRing } from './ScoreRing';
import { SignalMeter } from './SignalMeter';

interface AreaCardProps {
  recommendation: AreaRecommendation;
  /** Position in the visible list, used to stagger the entrance animation. */
  index: number;
}

export function AreaCard({ recommendation, index }: AreaCardProps) {
  const { rank, areaName, zone, score, potential, explanation, highlights, breakdown } =
    recommendation;

  return (
    <li
      className="animate-fade-up rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="flex items-start gap-4 sm:gap-5">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums',
            rank <= 3 ? 'bg-navy text-white' : 'bg-gray-100 text-gray-700',
          )}
        >
          <span className="sr-only">Rank </span>
          {rank}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
              <h3 className="text-lg font-bold text-gray-900">{areaName}</h3>
              {zone ? <span className="text-xs font-medium text-gray-500">{zone}</span> : null}
              <PotentialBadge level={potential} />
            </div>
            {/* On phones the gauge sits beside the name so the text keeps full width below. */}
            <ScoreRing score={score} potential={potential} className="shrink-0 sm:hidden" />
          </div>

          <p className="mt-2 text-sm leading-relaxed text-gray-600">{explanation}</p>

          {highlights.length > 0 ? (
            <ul aria-label="Area characteristics" className="mt-3 flex flex-wrap gap-1.5">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          ) : null}

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            <SignalMeter
              label="Audience fit"
              value={breakdown.audienceFit}
              hint="How well residents and visitors match this category's target audience"
            />
            <SignalMeter
              label="Activity"
              value={breakdown.activity}
              hint="Resident population and daily footfall, weighted for this category"
            />
            <SignalMeter
              label="Growth"
              value={breakdown.growth}
              hint="Pace of new residential and commercial development"
            />
            <SignalMeter
              label="White space"
              value={breakdown.whiteSpace}
              hint="100 minus the density of directly competing businesses"
            />
          </dl>
        </div>

        <ScoreRing score={score} potential={potential} className="hidden shrink-0 sm:block" />
      </div>
    </li>
  );
}
