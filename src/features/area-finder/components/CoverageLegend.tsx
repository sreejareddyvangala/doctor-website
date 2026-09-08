import type {
  SignalCoverage,
  SignalName,
  SignalProvenance,
} from '@shared/area-analysis/contracts';
import { cn } from '@/utils/cn';

const SIGNAL_LABELS: Record<SignalName, string> = {
  competition: 'Competition',
  footfall: 'Footfall',
  population: 'Population',
  affluence: 'Spending power',
  youngProfessionals: 'Young professionals',
  families: 'Families',
  students: 'Students',
  growth: 'Growth',
};

const GROUPS: Array<{ provenance: SignalProvenance; label: string; dot: string }> = [
  { provenance: 'measured', label: 'Measured', dot: 'bg-green-500' },
  { provenance: 'proxy', label: 'Estimated from map density', dot: 'bg-blue-500' },
  { provenance: 'sample', label: 'Sample values', dot: 'bg-amber-500' },
  { provenance: 'unavailable', label: 'Not connected yet', dot: 'bg-gray-300' },
];

interface CoverageLegendProps {
  coverage: SignalCoverage[];
  className?: string;
}

/** Tells the user which numbers are measured, which are estimates, and which are missing. */
export function CoverageLegend({ coverage, className }: CoverageLegendProps) {
  const groups = GROUPS.map((group) => ({
    ...group,
    items: coverage.filter((entry) => entry.provenance === group.provenance),
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className={cn('rounded-xl border border-gray-100 bg-white px-4 py-3', className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Data coverage</p>
      <dl className="mt-2 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
        {groups.map((group) => {
          const sources = Array.from(new Set(group.items.map((item) => item.source))).join(', ');
          const details = group.items
            .filter((item) => item.method)
            .map((item) => `${SIGNAL_LABELS[item.signal]}: ${item.method}`)
            .join('\n');

          return (
            <div key={group.provenance} className="flex items-start gap-2" title={details || undefined}>
              <span aria-hidden="true" className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', group.dot)} />
              <div className="min-w-0">
                <dt className="font-semibold text-gray-700">
                  {group.label}
                  {group.provenance === 'unavailable' ? '' : ` (${sources})`}
                </dt>
                <dd className="text-gray-600">
                  {group.items.map((item) => SIGNAL_LABELS[item.signal]).join(', ')}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
