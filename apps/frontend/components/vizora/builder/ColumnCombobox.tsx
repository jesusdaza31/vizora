'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getTableSchema } from '@/lib/vizora/dashboard-api';
import { cn } from '@/lib/utils';
import { Loader2, Search } from 'lucide-react';

type ColumnComboboxProps = {
  table: string;
  value: string | string[];
  onChange: (columns: string | string[]) => void;
  multiple?: boolean;
};

export function ColumnCombobox({ table, value, onChange, multiple = false }: ColumnComboboxProps) {
  const [columns, setColumns] = useState<Array<{ name: string; sqlType: string }>>([]);
  const [filteredColumns, setFilteredColumns] = useState<Array<{ name: string; sqlType: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && table && columns.length === 0) {
      setIsLoading(true);
      getTableSchema(table)
        .then((result) => {
          setColumns(result.columns ?? []);
          setFilteredColumns(result.columns ?? []);
        })
        .catch((err) => {
          console.error('Failed to load columns:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, table, columns.length]);

  useEffect(() => {
    if (search) {
      const lower = search.toLowerCase();
      setFilteredColumns(columns.filter((c) => c.name.toLowerCase().includes(lower)));
    } else {
      setFilteredColumns(columns);
    }
  }, [search, columns]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedValues = useMemo(() => {
    if (multiple) return Array.isArray(value) ? value : [];
    return typeof value === 'string' && value ? [value] : [];
  }, [value, multiple]);

  const handleSelect = (colName: string) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const next = current.includes(colName)
        ? current.filter((v) => v !== colName)
        : [...current, colName];
      onChange(next);
    } else {
      onChange(colName);
      setIsOpen(false);
      setSearch('');
    }
  };

  const displayValue = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      return arr.length > 0 ? arr.join(', ') : 'Select columns...';
    }
    return (value as string) || 'Select a column...';
  }, [value, multiple]);

  if (!table) {
    return (
      <div className="flex w-full items-center rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500">
        Select a table first
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm',
          'hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20',
          !selectedValues.length && 'text-slate-500',
          selectedValues.length > 0 && 'text-slate-900',
        )}
      >
        <span className="flex-1 truncate text-left">{displayValue}</span>
        <svg className="ml-2 h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search columns..."
                className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-7 pr-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto p-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            ) : filteredColumns.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">
                {search ? `No columns match "${search}"` : 'No columns found'}
              </p>
            ) : (
              filteredColumns.map((col) => {
                const isSelected = selectedValues.includes(col.name);
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => handleSelect(col.name)}
                    className={cn(
                      'flex w-full items-center rounded-sm px-2 py-1.5 text-xs transition-colors',
                      'hover:bg-teal-50 hover:text-teal-900',
                      isSelected && 'bg-teal-50 text-teal-900',
                    )}
                  >
                    <span className="flex-1 truncate text-left">{col.name}</span>
                    <span className="ml-2 text-[10px] text-slate-400">{col.sqlType}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
