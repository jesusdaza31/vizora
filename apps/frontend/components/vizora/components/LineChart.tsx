'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
} from 'recharts';
import type { WidgetProps } from '@/lib/vizora/widget-registry';

export default function LineChart({ config, data, theme, isLoading }: WidgetProps) {
  const options = config.options as { xAxis?: string; yAxis?: string[]; areaFill?: boolean; smooth?: boolean; title?: string };
  const title = options.title ?? '';

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  const chartData = data?.data ?? [];
  const xAxisKey = options.xAxis ?? config.dataSource.columns[0] ?? 'x';
  const yAxisKeys = Array.isArray(options.yAxis) ? options.yAxis : (options.yAxis ? [options.yAxis] : config.dataSource.columns.slice(1));

  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {title && <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {yAxisKeys.map((key, idx) => {
              const color = theme.chartPalette[idx % theme.chartPalette.length];
              if (options.areaFill) {
                return (
                  <Area
                    key={key}
                    type={options.smooth ? 'natural' : 'monotone'}
                    dataKey={key}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                );
              }
              return (
                <Line
                  key={key}
                  type={options.smooth ? 'natural' : 'monotone'}
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              );
            })}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
