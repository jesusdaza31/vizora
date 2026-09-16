'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/vizora/widget-registry';
import { ChevronUp, ChevronDown } from 'lucide-react';

type SortDirection = 'asc' | 'desc' | null;

export default function DataTable({ config, data, theme, isLoading }: WidgetProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const options = config.options as { pageSize?: number; sortable?: boolean; title?: string };
  const title = options.title ?? '';

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  const rows = data?.data ?? [];
  const columns = config.dataSource.columns;

  if (rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">No data available</p>
      </div>
    );
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') setSortColumn(null);
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * modifier;
    }
    return String(aVal).localeCompare(String(bVal)) * modifier;
  });

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      {title && (
        <div className="border-b border-slate-200 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-teal-600">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white hover:bg-teal-700"
                >
                  <div className="flex items-center gap-1">
                    {col}
                    {sortColumn === col && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 text-sm text-slate-700">
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
