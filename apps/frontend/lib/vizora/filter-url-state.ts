'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useBuilderStore } from '@/store/vizora-builder-store';
import type { FilterConfig } from '@/lib/vizora/types';

const FILTER_PREFIX = 'filter.';

type FilterValue =
  | string
  | string[]
  | { start: string; end: string }
  | { min: number; max: number }
  | boolean
  | null;

export function serializeFilterValue(value: FilterValue): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.length > 0 ? value.join(',') : null;
  if (typeof value === 'object' && 'start' in value && 'end' in value) {
    return value.start && value.end ? `${value.start},${value.end}` : null;
  }
  if (typeof value === 'object' && 'min' in value && 'max' in value) {
    return `${value.min},${value.max}`;
  }
  return null;
}

export function deserializeFilterValue(raw: string, vizoraType: string): FilterValue {
  if (!raw) return null;

  switch (vizoraType) {
    case 'boolean':
      return raw === 'true';
    case 'date': {
      const parts = raw.split(',');
      if (parts.length === 2 && parts[0] && parts[1]) {
        return { start: parts[0], end: parts[1] };
      }
      return null;
    }
    case 'number': {
      const parts = raw.split(',');
      if (parts.length === 2) {
        const min = Number(parts[0]);
        const max = Number(parts[1]);
        if (!Number.isNaN(min) && !Number.isNaN(max)) {
          return { min, max };
        }
      }
      return null;
    }
    case 'string':
    default:
      if (raw.includes(',')) {
        const arr = raw.split(',').filter(Boolean);
        return arr.length > 0 ? arr : null;
      }
      return raw;
  }
}

export function filtersToSearchParams(
  filters: FilterConfig[],
  values: Record<string, FilterValue>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const f of filters) {
    const serialized = serializeFilterValue(values[f.id] ?? null);
    if (serialized !== null) {
      params.set(`${FILTER_PREFIX}${f.column}`, serialized);
    }
  }
  return params;
}

export function searchParamsToFilters(
  filters: FilterConfig[],
  params: URLSearchParams,
): Record<string, FilterValue> {
  const result: Record<string, FilterValue> = {};
  for (const f of filters) {
    const raw = params.get(`${FILTER_PREFIX}${f.column}`);
    if (raw !== null) {
      result[f.id] = deserializeFilterValue(raw, f.vizoraType);
    }
  }
  return result;
}

export function useFilterUrlSync(filters: FilterConfig[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filterValues = useBuilderStore((s) => s.filterValues) as Record<string, FilterValue>;
  const setFilterValue = useBuilderStore((s) => s.setFilterValue);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current || filters.length === 0) return;
    isInitialized.current = true;

    const fromUrl = searchParamsToFilters(filters, searchParams);
    for (const [filterId, value] of Object.entries(fromUrl)) {
      if (value !== null && value !== undefined) {
        setFilterValue(filterId, value);
      }
    }
  }, [filters, searchParams, setFilterValue]);

  useEffect(() => {
    if (!isInitialized.current || filters.length === 0) return;

    const currentParams = filtersToSearchParams(filters, filterValues);
    const existingParams = new URLSearchParams(searchParams.toString());

    let changed = false;
    for (const f of filters) {
      const key = `${FILTER_PREFIX}${f.column}`;
      const current = currentParams.get(key);
      const existing = existingParams.get(key);
      if (current !== existing) {
        changed = true;
        if (current === null) {
          existingParams.delete(key);
        } else {
          existingParams.set(key, current);
        }
      }
    }

    if (changed) {
      const qs = existingParams.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.replace(url, { scroll: false });
    }
  }, [filterValues, filters, searchParams, router, pathname]);
}
