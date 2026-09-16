'use client';

import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/vizora/widget-registry';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Format = 'number' | 'currency' | 'percentage';

function formatValue(value: number, format: Format): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
}

export default function KpiCard({ config, data, theme, isLoading }: WidgetProps) {
  const options = config.options as { label?: string; format?: Format; trend?: 'up' | 'down' | 'neutral' | null; trendValue?: string; title?: string };
  const label = options.label ?? config.dataSource.columns[0] ?? 'Value';
  const format = options.format ?? 'number';
  const trend = options.trend ?? null;
  const trendValue = options.trendValue ?? '';
  const title = options.title ?? '';

  const rawValue = data?.data?.[0]?.[config.dataSource.columns[0] ?? 'value'];
  const value = typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50">
          <div className="h-5 w-5 rounded-full bg-teal-500" />
        </div>
        {title && <p className="text-sm font-medium text-slate-700">{title}</p>}
      </div>
      
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-3xl font-bold tracking-tight text-slate-900">
          {formatValue(value, format)}
        </p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>

      {trend && trend !== 'neutral' && trendValue && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={cn(
            'text-sm font-semibold',
            trend === 'up' ? 'text-emerald-600' : 'text-red-500'
          )}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}
