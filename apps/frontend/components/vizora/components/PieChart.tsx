'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import type { WidgetProps } from '@/lib/vizora/widget-registry';

export default function PieChart({ config, data, theme, isLoading }: WidgetProps) {
  const options = config.options as {
    nameKey?: string;
    valueKey?: string;
    donut?: boolean;
    title?: string;
    showLabels?: boolean;
  };

  const nameKey = options.nameKey ?? config.dataSource.columns[0] ?? 'name';
  const valueKey = options.valueKey ?? config.dataSource.columns[1] ?? 'value';
  const isDonut = options.donut ?? false;
  const title = options.title ?? '';
  const showLabels = options.showLabels ?? true;
  const palette = theme.chartPalette;

  if (isLoading) {
    return (
      <Card style={{ borderRadius: theme.borderRadius }}>
        <CardContent className="flex h-full min-h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.data ?? [];

  const renderLabel = showLabels
    ? (props: PieLabelRenderProps) => {
        if (props.percent === undefined) return null;
        return `${props.name ?? ''} ${(props.percent * 100).toFixed(0)}%`;
      }
    : undefined;

  return (
    <Card style={{ borderRadius: theme.borderRadius }} className="h-full">
      <CardContent className="h-full p-4">
        {title && <p className="mb-2 text-sm font-medium text-foreground">{title}</p>}
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <RechartsPieChart>
            <Pie
              data={chartData}
              dataKey={valueKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={isDonut ? '45%' : 0}
              outerRadius="80%"
              paddingAngle={2}
              label={renderLabel}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: theme.borderRadius,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
