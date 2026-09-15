'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import type { WidgetProps } from '@/lib/vizora/widget-registry';

export default function LineChart({ config, data, theme, isLoading }: WidgetProps) {
  const options = config.options as {
    xAxis?: string;
    yAxis?: string[];
    areaFill?: boolean;
    title?: string;
    smooth?: boolean;
  };

  const xKey = options.xAxis ?? config.dataSource.columns[0] ?? 'date';
  const yKeys = options.yAxis ?? config.dataSource.columns.slice(1);
  const title = options.title ?? '';
  const areaFill = options.areaFill ?? false;
  const smooth = options.smooth ?? false;
  const palette = theme.chartPalette;
  const curveType = smooth ? 'natural' : 'monotone';

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

  return (
    <Card style={{ borderRadius: theme.borderRadius }} className="h-full">
      <CardContent className="h-full p-4">
        {title && <p className="mb-2 text-sm font-medium text-foreground">{title}</p>}
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <RechartsLineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: theme.borderRadius,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {yKeys.map((key, i) =>
              areaFill ? (
                <Area
                  key={key}
                  type={curveType}
                  dataKey={key}
                  stroke={palette[i % palette.length]}
                  fill={palette[i % palette.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={{ r: 3, fill: palette[i % palette.length] }}
                  activeDot={{ r: 5 }}
                />
              ) : (
                <Line
                  key={key}
                  type={curveType}
                  dataKey={key}
                  stroke={palette[i % palette.length]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: palette[i % palette.length] }}
                  activeDot={{ r: 5 }}
                />
              ),
            )}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
