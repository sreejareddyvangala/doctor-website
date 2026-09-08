import { useEffect, useState } from 'react';

import type { PotentialLevel } from '@shared/area-analysis/contracts';
import { cn } from '@/utils/cn';

const SIZE = 84;
const STROKE = 7;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const RING_COLOURS: Record<PotentialLevel, string> = {
  high: 'stroke-green-500',
  medium: 'stroke-amber-500',
  low: 'stroke-gray-400',
};

interface ScoreRingProps {
  score: number;
  potential: PotentialLevel;
  className?: string;
}

/** Circular gauge for the 0-100 opportunity score. Fills from empty on mount. */
export function ScoreRing({ score, potential, className }: ScoreRingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setProgress(score));
    return () => window.cancelAnimationFrame(frame);
  }, [score]);

  const clamped = Math.min(100, Math.max(0, progress));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div
      role="img"
      aria-label={`Opportunity score ${score} out of 100`}
      className={cn('relative h-[72px] w-[72px] sm:h-[84px] sm:w-[84px]', className)}
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full -rotate-90"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-gray-100"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={cn(
            RING_COLOURS[potential],
            'transition-[stroke-dashoffset] duration-700 ease-out',
          )}
        />
      </svg>

      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center leading-none"
      >
        <span className="text-xl font-bold tabular-nums text-gray-900 sm:text-2xl">{score}</span>
        <span className="mt-0.5 text-[10px] font-medium text-gray-400">/100</span>
      </div>
    </div>
  );
}
