'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { searchTables } from '@/lib/vizora/dashboard-api';
import { cn } from '@/lib/utils';
import { ChevronsUpDown, Loader2, Check } from 'lucide-react';

type TableComboboxProps = {
  value: string;
  onChange: (table: string) => void;
};

export function TableCombobox({ value, onChange }: TableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['vizora-tables', search],
    queryFn: () => searchTables(search, 50, 0),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  const tables = data?.tables ?? [];

  const handleSelect = useCallback(
    (tableName: string) => {
      onChange(tableName);
      setOpen(false);
      setSearch('');
    },
    [onChange],
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={cn(
          'flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          !value && 'text-muted-foreground',
        )}
      >
        <span className="truncate">{value || 'Select a table...'}</span>
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
      </Popover.Trigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <div className="border-b border-border p-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tables..."
            className="h-8 text-xs"
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : tables.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">No tables found</p>
          ) : (
            tables.map((t) => (
              <button
                key={t.tableName}
                onClick={() => handleSelect(t.tableName)}
                className={cn(
                  'flex w-full items-center rounded-sm px-2 py-1.5 text-xs transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  value === t.tableName && 'bg-accent',
                )}
              >
                <Check
                  className={cn(
                    'mr-2 h-3 w-3',
                    value === t.tableName ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="truncate">{t.tableName}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover.Root>
  );
}
