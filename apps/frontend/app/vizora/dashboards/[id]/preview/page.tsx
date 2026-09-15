'use client';

import React from 'react';
import { useQueries } from '@tanstack/react-query';
import Link from 'next/link';
import { useBuilderStore } from '@/store/vizora-builder-store';
import { getDashboard } from '@/lib/vizora/dashboard-api';
import { executeQuery } from '@/lib/vizora/query-client';
import { migrateDashboardConfig } from '@/lib/vizora/config-migration';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { FilterBar } from '@/components/vizora/components/FilterControl';
import type { FilterValue } from '@/components/vizora/components/FilterControl';
import { FilterMetadataProvider, useFilterMetadata } from '@/components/vizora/builder/FilterMetadataProvider';
import { BuilderCanvas } from '@/components/vizora/builder/BuilderCanvas';
import { ThemeProvider } from '@/components/vizora/builder/ThemeProvider';
import { BuilderCanvasSkeleton } from '@/components/vizora/skeletons/BuilderCanvasSkeleton';
import type { FilterConfig, ComponentConfig } from '@/lib/vizora/types';

const DEFAULT_THEME = {
  primaryColor: '#6366f1',
  chartPalette: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
  fontSize: 'md' as const,
  borderRadius: 8 as const,
};

function PreviewContent({ id }: { id: string }) {
  const dashboard = useBuilderStore((s) => s.dashboard);
  const isLoading = useBuilderStore((s) => s.isLoading);
  const error = useBuilderStore((s) => s.error);
  const loadDashboard = useBuilderStore((s) => s.loadDashboard);
  const filterValues = useBuilderStore((s) => s.filterValues) as Record<string, FilterValue>;
  const setFilterValue = useBuilderStore((s) => s.setFilterValue);
  const getFilterQueryParams = useBuilderStore((s) => s.getFilterQueryParams);

  React.useEffect(() => {
    let cancelled = false;
    useBuilderStore.setState({ isLoading: true, error: null, isPreview: true });

    getDashboard(id)
      .then((data) => {
        if (!cancelled) loadDashboard({ ...data, config: migrateDashboardConfig(data.config) });
      })
      .catch((err) => {
        if (!cancelled) {
          useBuilderStore.setState({
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to load dashboard',
          });
        }
      });

    return () => { cancelled = true; };
  }, [id, loadDashboard]);

  const filterComponents = React.useMemo<ComponentConfig[]>(() => {
    if (!dashboard) return [];
    const comps: ComponentConfig[] = [];
    for (const page of dashboard.config.pages) {
      for (const comp of page.components) {
        if (comp.type === 'filter') comps.push(comp);
      }
    }
    return comps;
  }, [dashboard]);

  const filterConfigs = React.useMemo<FilterConfig[]>(() => {
    return filterComponents
      .map((comp) => (comp.options as { filterConfig?: FilterConfig }).filterConfig)
      .filter((fc): fc is FilterConfig => !!fc);
  }, [filterComponents]);

  const activePageId = useBuilderStore((s) => s.activePageId);

  const activeComponents = React.useMemo<ComponentConfig[]>(() => {
    if (!dashboard || !activePageId) return [];
    const page = dashboard.config.pages.find((p) => p.id === activePageId);
    return page?.components ?? [];
  }, [dashboard, activePageId]);

  const widgetQueries = useQueries({
    queries: activeComponents.map((comp) => {
      const table = comp.dataSource?.table ?? '';
      const columns = comp.dataSource?.columns ?? [];
      const aggregation = comp.dataSource?.aggregation;
      const fp = getFilterQueryParams(comp.filters ?? []);

      return {
        queryKey: [
          'widget-data',
          comp.id,
          table,
          ...columns,
          aggregation,
          ...Object.entries(fp).flatMap(([k, v]) => [k, v]),
        ],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          executeQuery(
            {
              table,
              columns,
              aggregation: aggregation
                ? { column: columns[0], function: aggregation }
                : undefined,
              filters: Object.keys(fp).length > 0 ? fp : undefined,
            },
            signal,
          ),
        enabled: table.length > 0 && comp.type !== 'text' && comp.type !== 'filter',
        staleTime: 5 * 60 * 1000,
        retry: 1,
      };
    }),
  });

  const dataMap = React.useMemo(
    () =>
      Object.fromEntries(
        activeComponents.map((comp, i) => [comp.id, widgetQueries[i]?.data ?? null]),
      ),
    [activeComponents, widgetQueries],
  );

  const loadingMap = React.useMemo(
    () =>
      Object.fromEntries(
        activeComponents.map((comp, i) => [comp.id, widgetQueries[i]?.isLoading ?? false]),
      ),
    [activeComponents, widgetQueries],
  );

  const errorMap = React.useMemo(
    () =>
      Object.fromEntries(
        activeComponents.map((comp, i) => [
          comp.id,
          widgetQueries[i]?.error instanceof Error
            ? widgetQueries[i].error.message
            : widgetQueries[i]?.error
              ? String(widgetQueries[i].error)
              : null,
        ]),
      ),
    [activeComponents, widgetQueries],
  );

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <header className="flex h-14 items-center border-b border-border px-6">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </header>
        <BuilderCanvasSkeleton className="flex-1" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const theme = dashboard?.config.theme ?? DEFAULT_THEME;

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border px-6">
          <Link
            href={`/vizora/dashboards/${id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </Link>
          <h1 className="text-sm font-medium text-foreground">{dashboard?.name}</h1>
        </header>

        {filterConfigs.length > 0 && (
          <div className="shrink-0 border-b border-border px-6 py-3">
            <FilterMetadataProvider filterComponents={filterComponents}>
              <FilterBarInner
                filterConfigs={filterConfigs}
                filterValues={filterValues}
                onFilterChange={setFilterValue}
              />
            </FilterMetadataProvider>
          </div>
        )}

        <main className="flex flex-1 flex-col overflow-hidden bg-muted/20">
          <BuilderCanvas
            theme={theme}
            dataMap={dataMap}
            loadingMap={loadingMap}
            errorMap={errorMap}
          />
        </main>
      </div>
    </ThemeProvider>
  );
}

function FilterBarInner({
  filterConfigs,
  filterValues,
  onFilterChange,
}: {
  filterConfigs: FilterConfig[];
  filterValues: Record<string, FilterValue>;
  onFilterChange: (filterId: string, value: FilterValue) => void;
}) {
  const { distinctValuesMap, numericBoundsMap } = useFilterMetadata();

  return (
    <FilterBar
      filters={filterConfigs}
      values={filterValues}
      onChange={onFilterChange}
      distinctValuesMap={distinctValuesMap}
      numericBoundsMap={numericBoundsMap}
    />
  );
}

export default function DashboardPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <PreviewContent id={id} />;
}
