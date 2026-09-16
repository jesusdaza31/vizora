'use client';

import { useState, useEffect } from 'react';
import { searchTables } from '@/lib/vizora/dashboard-api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type TableComboboxProps = {
  value: string;
  onChange: (table: string) => void;
};

export function TableCombobox({ value, onChange }: TableComboboxProps) {
  const [tables, setTables] = useState<Array<{ tableName: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && tables.length === 0) {
      setIsLoading(true);
      searchTables('', 100, 0)
        .then((result) => {
          setTables(result.tables ?? []);
        })
        .catch((err) => {
          console.error('Failed to load tables:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, tables.length]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm',
          'hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20',
          !value && 'text-slate-500',
          value && 'text-slate-900',
        )}
      >
        <span className="truncate">{value || 'Select a table...'}</span>
        <svg className="ml-2 h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="max-h-[200px] overflow-y-auto p-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            ) : tables.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">No tables found</p>
            ) : (
              tables.map((t) => (
                <button
                  key={t.tableName}
                  type="button"
                  onClick={() => {
                    onChange(t.tableName);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center rounded-sm px-2 py-1.5 text-xs transition-colors',
                    'hover:bg-teal-50 hover:text-teal-900',
                    value === t.tableName && 'bg-teal-50 text-teal-900',
                  )}
                >
                  <span className="truncate">{t.tableName}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
