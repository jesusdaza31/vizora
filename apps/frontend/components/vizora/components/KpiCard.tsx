'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/vizora/widget-registry';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
      <Card style={{ borderRadius: theme.borderRadius }}>
        <CardContent className="flex h-full items-center justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ borderRadius: theme.borderRadius }}>
      <CardContent className="flex h-full flex-col justify-center gap-2 p-6">
        {title && <p className="mb-1 text-sm font-medium text-foreground">{title}</p>}
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ color: theme.primaryColor }}
        >
          {formatValue(value, format)}
        </p>
        {trend && trend !== 'neutral' && trendValue && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend === 'up' ? 'text-emerald-600' : 'text-red-500',
            )}
          >
            {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
