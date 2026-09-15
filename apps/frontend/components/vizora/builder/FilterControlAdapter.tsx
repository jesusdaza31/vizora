'use client';

import { useQuery } from '@tanstack/react-query';
import { getDistinctValues, getNumericBounds } from '@/lib/vizora/dashboard-api';
import { FilterControl } from '../components/FilterControl';
import type { FilterValue } from '../components/FilterControl';
import type { ComponentConfig, FilterConfig } from '@/lib/vizora/types';

type FilterControlAdapterProps = {
  component: ComponentConfig;
  filterValue: FilterValue;
  onChange: (value: FilterValue) => void;
};

export function FilterControlAdapter({ component, filterValue, onChange }: FilterControlAdapterProps) {
  const filterConfig = (component.options as { filterConfig?: FilterConfig }).filterConfig;
  const table = component.dataSource?.table ?? '';

  const distinctQuery = useQuery({
    queryKey: ['distinct-values', table, filterConfig?.column],
    queryFn: () => getDistinctValues(table, filterConfig!.column),
    enabled: !!filterConfig && !!table && filterConfig.vizoraType === 'string',
    staleTime: 5 * 60 * 1000,
  });

  const boundsQuery = useQuery({
    queryKey: ['numeric-bounds', table, filterConfig?.column],
    queryFn: () => getNumericBounds(table, filterConfig!.column),
    enabled: !!filterConfig && !!table && filterConfig.vizoraType === 'number',
    staleTime: 5 * 60 * 1000,
  });

  if (!filterConfig) return null;

  return (
    <FilterControl
      filter={filterConfig}
      value={filterValue}
      onChange={onChange}
      distinctValues={distinctQuery.data?.values as string[] | undefined}
      numericBounds={
        boundsQuery.data?.min != null && boundsQuery.data?.max != null
          ? { min: boundsQuery.data.min, max: boundsQuery.data.max }
          : undefined
      }
    />
  );
}
