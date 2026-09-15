'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getDistinctValues, getNumericBounds } from '@/lib/vizora/dashboard-api';
import type { ComponentConfig, FilterConfig } from '@/lib/vizora/types';

type FilterMetadata = {
  distinctValuesMap: Record<string, string[]>;
  numericBoundsMap: Record<string, { min: number; max: number }>;
};

const FilterMetadataContext = createContext<FilterMetadata>({
  distinctValuesMap: {},
  numericBoundsMap: {},
});

export function useFilterMetadata() {
  return useContext(FilterMetadataContext);
}

type FilterMetadataProviderProps = {
  filterComponents: ComponentConfig[];
  children: React.ReactNode;
};

export function FilterMetadataProvider({ filterComponents, children }: FilterMetadataProviderProps) {
  const filterEntries = useMemo(() => {
    const entries: { filterId: string; table: string; column: string; vizoraType: string }[] = [];
    for (const comp of filterComponents) {
      const fc = (comp.options as { filterConfig?: FilterConfig }).filterConfig;
      if (!fc) continue;
      const table = comp.dataSource?.table ?? '';
      if (!table || !fc.column) continue;
      entries.push({ filterId: fc.id, table, column: fc.column, vizoraType: fc.vizoraType });
    }
    return entries;
  }, [filterComponents]);

  const stringEntries = filterEntries.filter((e) => e.vizoraType === 'string');
  const numberEntries = filterEntries.filter((e) => e.vizoraType === 'number');

  const distinctQueries = useQueries({
    queries: stringEntries.map((entry) => ({
      queryKey: ['distinct-values', entry.table, entry.column],
      queryFn: () => getDistinctValues(entry.table, entry.column),
      enabled: !!entry.table && !!entry.column,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const boundsQueries = useQueries({
    queries: numberEntries.map((entry) => ({
      queryKey: ['numeric-bounds', entry.table, entry.column],
      queryFn: () => getNumericBounds(entry.table, entry.column),
      enabled: !!entry.table && !!entry.column,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const value = useMemo<FilterMetadata>(() => {
    const distinctValuesMap: Record<string, string[]> = {};
    for (let i = 0; i < stringEntries.length; i++) {
      const data = distinctQueries[i]?.data;
      if (data) {
        distinctValuesMap[stringEntries[i].filterId] = data.values as string[];
      }
    }

    const numericBoundsMap: Record<string, { min: number; max: number }> = {};
    for (let i = 0; i < numberEntries.length; i++) {
      const data = boundsQueries[i]?.data;
      if (data && data.min != null && data.max != null) {
        numericBoundsMap[numberEntries[i].filterId] = { min: data.min, max: data.max };
      }
    }

    return { distinctValuesMap, numericBoundsMap };
  }, [stringEntries, numberEntries, distinctQueries, boundsQueries]);

  return (
    <FilterMetadataContext.Provider value={value}>
      {children}
    </FilterMetadataContext.Provider>
  );
}
