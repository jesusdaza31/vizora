import { type ComponentType, lazy } from 'react';
import type { WidgetType, ComponentConfig, QueryResult, ThemeConfig } from './types';

export type WidgetProps = {
  config: ComponentConfig;
  data: QueryResult | null;
  theme: ThemeConfig;
  isLoading: boolean;
  error: string | null;
};

type RegistryEntry = {
  load: () => Promise<{ default: ComponentType<WidgetProps> }>;
};

export const widgetRegistry: Record<WidgetType, RegistryEntry> = {
  kpi: { load: () => import('@/components/vizora/components/KpiCard') },
  bar: { load: () => import('@/components/vizora/components/BarChart') },
  line: { load: () => import('@/components/vizora/components/LineChart') },
  pie: { load: () => import('@/components/vizora/components/PieChart') },
  table: { load: () => import('@/components/vizora/components/DataTable') },
  filter: { load: () => import('@/components/vizora/components/FilterControl').then(m => ({ default: m.FilterControl as any })) },
  text: { load: () => import('@/components/vizora/components/TextBlock') },
};

export const LazyKpiCard = lazy(widgetRegistry.kpi.load);
export const LazyBarChart = lazy(widgetRegistry.bar.load);
export const LazyLineChart = lazy(widgetRegistry.line.load);
export const LazyPieChart = lazy(widgetRegistry.pie.load);
export const LazyDataTable = lazy(widgetRegistry.table.load);
export const LazyTextBlock = lazy(widgetRegistry.text.load);
export const LazyFilterControl = lazy(widgetRegistry.filter.load);

const syncComponents: Partial<Record<WidgetType, ComponentType<WidgetProps>>> = {};

export function getWidgetComponent(type: WidgetType): ComponentType<WidgetProps> | null {
  if (syncComponents[type]) return syncComponents[type]!;
  const entry = widgetRegistry[type];
  if (!entry) return null;
  // Trigger sync import resolution for lazy-loaded modules
  entry.load().then((mod) => {
    syncComponents[type] = mod.default;
  });
  return syncComponents[type] ?? null;
}
