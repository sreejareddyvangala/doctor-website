interface SignalMeterProps {
  label: string;
  /** 0-100, or null when the current data source has no signal behind it. */
  value: number | null;
  /** Shown as a tooltip so the metric is self-explanatory. */
  hint: string;
}

/** One row of a score breakdown: label, value and a thin bar. Renders inside a `<dl>`. */
export function SignalMeter({ label, value, hint }: SignalMeterProps) {
  if (value === null) {
    return (
      <div title={`${hint}. Not available from the current data source.`}>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-xs font-medium text-gray-400">{label}</dt>
          <dd className="text-xs font-medium text-gray-400">n/a</dd>
        </div>
        <div
          aria-hidden="true"
          className="mt-1.5 h-1.5 w-full rounded-full border border-dashed border-gray-200"
        />
      </div>
    );
  }

  const width = Math.min(100, Math.max(0, value));

  return (
    <div title={hint}>
      <div className="flex items-baseline justify-between gap-2">
        <dt className="text-xs font-medium text-gray-500">{label}</dt>
        <dd className="text-xs font-semibold tabular-nums text-gray-700">{value}</dd>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
