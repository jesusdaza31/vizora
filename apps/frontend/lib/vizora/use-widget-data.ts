import { useQuery } from '@tanstack/react-query';
import { executeQuery } from './query-client';
import type { ComponentConfig, QueryResult } from './types';

export function useWidgetData(
  config: ComponentConfig | null,
  filterParams: Record<string, unknown>,
): { data: QueryResult | null; loading: boolean; error: string | null } {
  const table = config?.dataSource?.table ?? '';
  const columns = config?.dataSource?.columns ?? [];
  const aggregation = config?.dataSource?.aggregation;

  const queryKey = [
    'widget-data',
    config?.id,
    table,
    ...columns,
    aggregation,
    ...Object.entries(filterParams).flatMap(([k, v]) => [k, v]),
  ];

  const { data, isLoading, error } = useQuery<QueryResult>({
    queryKey,
    queryFn: ({ signal }) =>
      executeQuery(
        {
          table,
          columns,
          aggregation: aggregation ? { column: columns[0], function: aggregation } : undefined,
          filters: Object.keys(filterParams).length > 0 ? filterParams : undefined,
        },
        signal,
      ),
    enabled: !!config && table.length > 0 && config.type !== 'text',
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
  };
}
