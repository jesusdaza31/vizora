'use client';

import React from 'react';
import { useQueries } from '@tanstack/react-query';
import { useBuilderStore } from '@/store/vizora-builder-store';
import { getDashboard } from '@/lib/vizora/dashboard-api';
import { executeQuery } from '@/lib/vizora/query-client';
import { migrateDashboardConfig } from '@/lib/vizora/config-migration';
import { AlertCircle } from 'lucide-react';
import { useFilterUrlSync } from '@/lib/vizora/filter-url-state';
import type { FilterConfig, QueryResult, ComponentConfig } from '@/lib/vizora/types';
import { Toolbar } from '@/components/vizora/builder/Toolbar';
import { ComponentPanel } from '@/components/vizora/builder/ComponentPanel';
import { BuilderCanvas } from '@/components/vizora/builder/BuilderCanvas';
import { PropertyEditor } from '@/components/vizora/builder/PropertyEditor';
import { ThemeProvider } from '@/components/vizora/builder/ThemeProvider';
import { BuilderCanvasSkeleton } from '@/components/vizora/skeletons/BuilderCanvasSkeleton';

const DEFAULT_THEME = {
  primaryColor: '#0d9488',
  chartPalette: ['#0d9488', '#14b8a6', '#06b6d4', '#22d3ee', '#f59e0b', '#ef4444'],
  fontSize: 'md' as const,
  borderRadius: 12 as const,
};

export default function DashboardEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { dashboard, isLoading, error, loadDashboard } = useBuilderStore();
  const isDirty = useBuilderStore((s) => s.isDirty);

  React.useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  React.useEffect(() => {
    let cancelled = false;
    useBuilderStore.setState({ isLoading: true, error: null });

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

    return () => {
      cancelled = true;
    };
  }, [id, loadDashboard]);

  const filterConfigs: FilterConfig[] = React.useMemo(() => {
    if (!dashboard) return [];
    const filters: FilterConfig[] = [];
    for (const page of dashboard.config.pages) {
      for (const comp of page.components) {
        if (comp.type === 'filter') {
          const options = comp.options as { filterConfig?: FilterConfig };
          if (options.filterConfig) {
            filters.push(options.filterConfig);
          }
        }
      }
    }
    return filters;
  }, [dashboard]);

  useFilterUrlSync(filterConfigs);

  const getFilterQueryParams = useBuilderStore((s) => s.getFilterQueryParams);
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
      const filterParams = getFilterQueryParams(comp.filters ?? []);

      return {
        queryKey: [
          'widget-data',
          comp.id,
          table,
          ...columns,
          aggregation,
          ...Object.entries(filterParams).flatMap(([k, v]) => [k, v]),
        ],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          executeQuery(
            {
              table,
              columns,
              aggregation: aggregation
                ? { column: columns[0], function: aggregation }
                : undefined,
              filters: Object.keys(filterParams).length > 0 ? filterParams : undefined,
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
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden w-16 shrink-0 border-r border-border bg-card md:block lg:w-60">
            <ComponentPanel />
          </div>
          <main className="flex flex-1 flex-col overflow-hidden bg-muted/20">
            <BuilderCanvasSkeleton className="flex-1" />
          </main>
          <div className="hidden w-72 shrink-0 border-l border-border bg-card lg:block" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={dashboard?.config.theme ?? DEFAULT_THEME}>
      <div className="flex h-screen flex-col bg-background">
        <Toolbar />

        <div className="flex flex-1 overflow-hidden">
          <aside className="hidden w-16 shrink-0 flex-col border-r border-border bg-card md:flex lg:w-60">
            <ComponentPanel />
          </aside>

          <main className="flex flex-1 flex-col overflow-hidden bg-slate-50">
            <BuilderCanvas
              theme={dashboard?.config.theme ?? DEFAULT_THEME}
              dataMap={dataMap}
              loadingMap={loadingMap}
              errorMap={errorMap}
            />
          </main>

          <aside className="hidden w-72 shrink-0 flex-col border-l border-border bg-card lg:flex">
            <PropertyEditor />
          </aside>
        </div>
      </div>
    </ThemeProvider>
  );
}
