'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { X, ChevronDown } from 'lucide-react';
import type { FilterConfig, VizoraType } from '@/lib/vizora/types';

export type FilterValue =
  | string
  | string[]
  | { start: string; end: string }
  | { min: number; max: number }
  | boolean
  | null;

type FilterControlProps = {
  filter: FilterConfig;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  distinctValues?: string[];
  numericBounds?: { min: number; max: number };
};

function DropdownFilter({
  filter,
  value,
  onChange,
  distinctValues,
}: FilterControlProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-foreground">{filter.label}</label>
      <Select.Root
        value={(value as string) ?? null}
        onValueChange={(v: string | null) => onChange(v || null)}
      >
        <SelectTrigger className="h-8 w-40 text-xs">
          <Select.Value placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {(distinctValues ?? []).map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select.Root>
    </div>
  );
}

function MultiSelectFilter({
  filter,
  value,
  onChange,
  distinctValues,
}: FilterControlProps) {
  const [open, setOpen] = useState(false);
  const selected = (value as string[]) ?? [];

  const toggle = useCallback(
    (v: string) => {
      const next = selected.includes(v)
        ? selected.filter((s) => s !== v)
        : [...selected, v];
      onChange(next.length > 0 ? next : null);
    },
    [selected, onChange],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-foreground">{filter.label}</label>
      <Popover.Root open={open} onOpenChange={(o: boolean) => setOpen(o)}>
        <Popover.Trigger
          className={cn(
            'flex h-8 w-40 items-center justify-between rounded-md border border-border bg-transparent px-3 text-xs',
            !selected.length && 'text-muted-foreground',
          )}
        >
          <span className="truncate">
            {selected.length === 0
              ? 'All'
              : selected.length === 1
                ? selected[0]
                : `${selected.length} selected`}
          </span>
          <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Popover.Trigger>
        <PopoverContent className="w-56 p-2" align="start">
          <div className="flex flex-col gap-0.5">
            {(distinctValues ?? []).map((v) => (
              <label
                key={v}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
              >
                <Checkbox
                  checked={selected.includes(v)}
                  onCheckedChange={() => toggle(v)}
                />
                <span>{v}</span>
              </label>
            ))}
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="mt-1 flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover.Root>
    </div>
  );
}

function DateRangePicker({
  filter,
  value,
  onChange,
}: FilterControlProps) {
  const range = (value as { start: string; end: string }) ?? { start: '', end: '' };

  const update = useCallback(
    (field: 'start' | 'end', v: string) => {
      const next = { ...range, [field]: v };
      if (next.start && next.end) {
        onChange(next);
      } else if (!next.start && !next.end) {
        onChange(null);
      } else {
        onChange(next);
      }
    },
    [range, onChange],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-foreground">{filter.label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={range.start}
          onChange={(e) => update('start', e.target.value)}
          className="h-8 flex-1 rounded-md border border-border bg-transparent px-2 text-xs text-foreground"
        />
        <span className="text-xs text-muted-foreground">–</span>
        <input
          type="date"
          value={range.end}
          onChange={(e) => update('end', e.target.value)}
          className="h-8 flex-1 rounded-md border border-border bg-transparent px-2 text-xs text-foreground"
        />
      </div>
    </div>
  );
}

function NumericRangeSlider({
  filter,
  value,
  onChange,
  numericBounds,
}: FilterControlProps) {
  const bounds = numericBounds ?? { min: 0, max: 100 };
  const range = (value as { min: number; max: number }) ?? null;
  const current: [number, number] = range
    ? [range.min, range.max]
    : [bounds.min, bounds.max];

  const handleChange = useCallback(
    (v: number | readonly number[]) => {
      const arr = Array.isArray(v) ? v : [v];
      if (arr.length >= 2) {
        const lo = arr[0] as number;
        const hi = arr[1] as number;
        if (lo === bounds.min && hi === bounds.max) {
          onChange(null);
        } else {
          onChange({ min: lo, max: hi });
        }
      }
    },
    [bounds, onChange],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground">{filter.label}</label>
        <span className="text-[10px] text-muted-foreground">
          {current[0]} – {current[1]}
        </span>
      </div>
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={1}
        value={current}
        onValueChange={handleChange}
        className="w-40"
      />
    </div>
  );
}

function BooleanToggle({
  filter,
  value,
  onChange,
}: FilterControlProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs font-medium text-foreground">{filter.label}</label>
      <Switch
        checked={(value as boolean) ?? false}
        onCheckedChange={(v: boolean) => onChange(v || null)}
      />
    </div>
  );
}

function detectVariant(vizoraType: VizoraType): 'dropdown' | 'multiselect' | 'daterange' | 'numeric' | 'boolean' {
  switch (vizoraType) {
    case 'string':
      return 'dropdown';
    case 'date':
      return 'daterange';
    case 'number':
      return 'numeric';
    case 'boolean':
      return 'boolean';
    default:
      return 'dropdown';
  }
}

export function FilterControl(props: FilterControlProps & { variant?: 'dropdown' | 'multiselect' }) {
  const variant = props.variant ?? detectVariant(props.filter.vizoraType);

  switch (variant) {
    case 'dropdown':
      return <DropdownFilter {...props} />;
    case 'multiselect':
      return <MultiSelectFilter {...props} />;
    case 'daterange':
      return <DateRangePicker {...props} />;
    case 'numeric':
      return <NumericRangeSlider {...props} />;
    case 'boolean':
      return <BooleanToggle {...props} />;
    default:
      return <DropdownFilter {...props} />;
  }
}

export function FilterBar({
  filters,
  values,
  onChange,
  distinctValuesMap,
  numericBoundsMap,
}: {
  filters: FilterConfig[];
  values: Record<string, FilterValue>;
  onChange: (filterId: string, value: FilterValue) => void;
  distinctValuesMap?: Record<string, string[]>;
  numericBoundsMap?: Record<string, { min: number; max: number }>;
}) {
  const hasActive = Object.values(values).some((v) => v !== null && v !== undefined);

  return (
    <div className="flex flex-wrap items-end gap-3">
      {filters.map((f) => (
        <FilterControl
          key={f.id}
          filter={f}
          value={values[f.id] ?? null}
          onChange={(v) => onChange(f.id, v)}
          distinctValues={distinctValuesMap?.[f.id]}
          numericBounds={numericBoundsMap?.[f.id]}
        />
      ))}
      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => filters.forEach((f) => onChange(f.id, null))}
          className="h-8 text-xs"
        >
          <X className="mr-1 h-3 w-3" /> Clear all
        </Button>
      )}
    </div>
  );
}
