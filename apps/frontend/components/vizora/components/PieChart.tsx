'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { WidgetProps } from '@/lib/vizora/widget-registry';

export default function PieChart({ config, data, theme, isLoading }: WidgetProps) {
  const options = config.options as { nameKey?: string; valueKey?: string; donut?: boolean; showLabels?: boolean; title?: string };
  const title = options.title ?? '';

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  const chartData = data?.data ?? [];
  const nameKey = options.nameKey ?? config.dataSource.columns[0] ?? 'name';
  const valueKey = options.valueKey ?? config.dataSource.columns[1] ?? 'value';

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
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={options.donut ? '50%' : 0}
              outerRadius="80%"
              paddingAngle={2}
              dataKey={valueKey}
              nameKey={nameKey}
              label={options.showLabels ? (({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`) : undefined}
            >
              {chartData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={theme.chartPalette[idx % theme.chartPalette.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
