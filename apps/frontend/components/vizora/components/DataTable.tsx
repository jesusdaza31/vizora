'use client';

import { useState, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { WidgetProps } from '@/lib/vizora/widget-registry';

type SortDirection = 'ASC' | 'DESC' | null;
type SortState = { column: string; direction: SortDirection };

type DataTableProps = WidgetProps & {
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSort?: (sort: SortState) => void;
};

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'ASC') return <ChevronUp className="h-3.5 w-3.5" />;
  if (direction === 'DESC') return <ChevronDown className="h-3.5 w-3.5" />;
  return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
}

export default function DataTable({
  config,
  data,
  theme,
  isLoading,
  totalCount: externalTotal,
  page: externalPage,
  pageSize: externalPageSize,
  onPageChange,
  onSort,
}: DataTableProps) {
  const columns = config.dataSource.columns;
  const options = config.options as { title?: string };
  const title = options.title ?? '';

  const [internalSort, setInternalSort] = useState<SortState>({ column: '', direction: null });
  const [internalPage, setInternalPage] = useState(0);

  const isControlled = externalPage !== undefined && onPageChange !== undefined;
  const currentPage = isControlled ? externalPage : internalPage;
  const total = externalTotal ?? data?.totalCount ?? 0;
  const pageSize = externalPageSize ?? data?.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const rows = data?.data ?? [];

  const handleSort = useCallback(
    (column: string) => {
      const next: SortState =
        internalSort.column === column
          ? internalSort.direction === 'ASC'
            ? { column, direction: 'DESC' }
            : internalSort.direction === 'DESC'
              ? { column: '', direction: null }
              : { column, direction: 'ASC' }
          : { column, direction: 'ASC' };

      if (!isControlled) setInternalSort(next);
      onSort?.(next);
    },
    [internalSort, isControlled, onSort],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (!isControlled) setInternalPage(page);
      onPageChange?.(page);
    },
    [isControlled, onPageChange],
  );

  if (isLoading) {
    return (
      <Card style={{ borderRadius: theme.borderRadius }}>
        <CardContent className="flex h-full min-h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ borderRadius: theme.borderRadius }} className="h-full">
      <CardContent className="h-full p-4">
        {title && <p className="mb-3 text-sm font-medium text-foreground">{title}</p>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col}>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-left font-medium"
                      onClick={() => handleSort(col)}
                    >
                      <span className="capitalize">{col}</span>
                      <SortIcon
                        direction={internalSort.column === col ? internalSort.direction : null}
                      />
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col}>
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  'border border-border hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent',
                )}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  'border border-border hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent',
                )}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
