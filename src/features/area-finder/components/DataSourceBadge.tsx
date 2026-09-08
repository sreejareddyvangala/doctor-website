import { TbDatabase, TbFlask } from 'react-icons/tb';

import type { DataSourceInfo } from '@shared/area-analysis/contracts';
import { cn } from '@/utils/cn';

interface DataSourceBadgeProps {
  dataSource: DataSourceInfo;
  className?: string;
}

/**
 * Tells the user what the numbers are based on. Sample data is flagged in
 * amber so it is never mistaken for real measurements.
 */
export function DataSourceBadge({ dataSource, className }: DataSourceBadgeProps) {
  const Icon = dataSource.isSample ? TbFlask : TbDatabase;
  const title = dataSource.isSample
    ? 'Results are computed from an illustrative sample dataset, not real measurements.'
    : `Results are computed from ${dataSource.label} data.`;

  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1',
        dataSource.isSample
          ? 'bg-amber-50 text-amber-800 ring-amber-200'
          : 'bg-blue-50 text-blue-700 ring-blue-200',
        className,
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {dataSource.isSample ? 'Sample data' : dataSource.label}
    </span>
  );
}

interface AttributionProps {
  dataSource: DataSourceInfo;
  className?: string;
}

/** Licence credit the data source requires, e.g. OpenStreetMap's ODbL notice. */
export function Attribution({ dataSource, className }: AttributionProps) {
  if (!dataSource.attribution) return null;

  if (dataSource.attributionUrl) {
    return (
      <a
        href={dataSource.attributionUrl}
        target="_blank"
        rel="noreferrer"
        className={cn('underline decoration-gray-300 underline-offset-2 hover:text-blue-700', className)}
      >
        {dataSource.attribution}
      </a>
    );
  }

  return <span className={className}>{dataSource.attribution}</span>;
}
