'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { getTableSchema } from '@/lib/vizora/dashboard-api';
import { cn } from '@/lib/utils';
import { ChevronsUpDown, Loader2, Check } from 'lucide-react';

type ColumnComboboxProps = {
  table: string;
  value: string | string[];
  onChange: (columns: string | string[]) => void;
  multiple?: boolean;
};

export function ColumnCombobox({ table, value, onChange, multiple = false }: ColumnComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['vizora-schema', table],
    queryFn: () => getTableSchema(table),
    staleTime: 5 * 60 * 1000,
    enabled: !!table && open,
  });

  const columns = useMemo(() => {
    const cols = data?.columns ?? [];
    if (!search) return cols;
    const lower = search.toLowerCase();
    return cols.filter((c) => c.name.toLowerCase().includes(lower));
  }, [data, search]);

  const selectedValues = useMemo(() => {
    if (multiple) return Array.isArray(value) ? value : [];
    return typeof value === 'string' && value ? [value] : [];
  }, [value, multiple]);

  const handleSelect = useCallback(
    (colName: string) => {
      if (multiple) {
        const current = Array.isArray(value) ? value : [];
        const next = current.includes(colName)
          ? current.filter((v) => v !== colName)
          : [...current, colName];
        onChange(next);
      } else {
        onChange(colName);
        setOpen(false);
        setSearch('');
      }
    },
    [multiple, value, onChange],
  );

  const displayValue = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      return arr.length > 0 ? arr.join(', ') : 'Select columns...';
    }
    return (value as string) || 'Select a column...';
  }, [value, multiple]);

  if (!table) {
    return (
      <div className="flex w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
        Select a table first
      </div>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={cn(
          'flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          !selectedValues.length && 'text-muted-foreground',
        )}
      >
        <span className="flex-1 truncate text-left">{displayValue}</span>
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
      </Popover.Trigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <div className="border-b border-border p-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search columns..."
            className="h-8 text-xs"
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : columns.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">No columns found</p>
          ) : (
            columns.map((col) => {
              const isSelected = selectedValues.includes(col.name);
              return (
                <button
                  key={col.name}
                  onClick={() => handleSelect(col.name)}
                  className={cn(
                    'flex w-full items-center rounded-sm px-2 py-1.5 text-xs transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isSelected && 'bg-accent',
                  )}
                >
                  <Check className={cn('mr-2 h-3 w-3', isSelected ? 'opacity-100' : 'opacity-0')} />
                  <span className="truncate">{col.name}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{col.sqlType}</span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover.Root>
  );
}
