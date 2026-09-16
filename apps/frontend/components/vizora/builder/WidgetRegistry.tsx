'use client';

import { Suspense } from 'react';
import type { ComponentConfig, QueryResult, ThemeConfig } from '@/lib/vizora/types';
import {
  LazyKpiCard,
  LazyBarChart,
  LazyLineChart,
  LazyPieChart,
  LazyDataTable,
  LazyTextBlock,
} from '@/lib/vizora/widget-registry';
import { FilterControlAdapter } from './FilterControlAdapter';
import { useBuilderStore } from '@/store/vizora-builder-store';
import type { FilterValue } from '../components/FilterControl';

type WidgetRegistryProps = {
  config: ComponentConfig;
  data: QueryResult | null;
  theme: ThemeConfig;
  isLoading?: boolean;
  error?: string | null;
};

function WidgetFallback() {
  return (
    <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-border bg-card">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
    </div>
  );
}

function WidgetError({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}

function WidgetNotFound({ type }: { type: string }) {
  return (
    <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">Unknown widget type: {type}</p>
    </div>
  );
}

function WidgetNoData() {
  return (
    <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">No data matches current filters</p>
    </div>
  );
}

const widgetMap = {
  kpi: LazyKpiCard,
  bar: LazyBarChart,
  line: LazyLineChart,
  pie: LazyPieChart,
  table: LazyDataTable,
  text: LazyTextBlock,
} as const;

function FilterWidgetWrapper({ config, theme }: { config: ComponentConfig; theme: ThemeConfig }) {
  const filterValues = useBuilderStore((s) => s.filterValues);
  const setFilterValue = useBuilderStore((s) => s.setFilterValue);

  const filterValue = (filterValues[config.id] ?? '') as FilterValue;
  const handleChange = (value: FilterValue) => {
    setFilterValue(config.id, value);
  };

  return <FilterControlAdapter component={config} filterValue={filterValue} onChange={handleChange} />;
}

export function WidgetRegistry({ config, data, theme, isLoading = false, error = null }: WidgetRegistryProps) {
  if (error) return <WidgetError message={error} />;

  // Special handling for filter widgets
  if (config.type === 'filter') {
    return (
      <Suspense fallback={<WidgetFallback />}>
        <FilterWidgetWrapper config={config} theme={theme} />
      </Suspense>
    );
  }

  const Component = widgetMap[config.type as keyof typeof widgetMap];
  if (!Component) return <WidgetNotFound type={config.type} />;

  const hasData = data && data.data && data.data.length > 0;
  const hasFilters = config.filters && config.filters.length > 0;
  
  if (!isLoading && hasFilters && !hasData) {
    return <WidgetNoData />;
  }

  return (
    <Suspense fallback={<WidgetFallback />}>
      <Component config={config} data={data} theme={theme} isLoading={isLoading} error={null} />
    </Suspense>
  );
}
