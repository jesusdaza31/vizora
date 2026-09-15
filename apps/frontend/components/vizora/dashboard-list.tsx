'use client';

import { useEffect, useState, useMemo } from 'react';
import { listDashboards, deleteDashboard, duplicateDashboard } from '@/lib/vizora/dashboard-api';
import { cn } from '@/lib/utils';
import { Edit, Trash2, Copy, LayoutDashboard, Loader2, Search, SortAsc, FileText, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { DashboardDTO } from '@/lib/vizora/types';
import { ConfirmDialog } from '@/components/vizora/ui/ConfirmDialog';
import { RelativeTime } from '@/components/vizora/ui/RelativeTime';

type SortOption = 'name-asc' | 'name-desc' | 'updated-desc' | 'updated-asc' | 'created-desc' | 'created-asc';

export default function DashboardList() {
  const [dashboards, setDashboards] = useState<DashboardDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated-desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    listDashboards()
      .then((data) => setDashboards(data.dashboards ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboards'))
      .finally(() => setLoading(false));
  }, []);

  const filteredDashboards = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = q
      ? dashboards.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            (d.description ?? '').toLowerCase().includes(q),
        )
      : dashboards;

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'updated-desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'updated-asc':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'created-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'created-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [dashboards, searchQuery, sortBy]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDashboard(id);
      setDashboards((prev) => prev.filter((d) => d.id !== id));
      toast.success('Dashboard deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete dashboard');
    }
    setDeleteConfirmId(null);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await duplicateDashboard(id);
      setDashboards((prev) => [...prev, duplicated]);
      toast.success('Dashboard duplicated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <p className="text-sm font-medium text-slate-500">Loading dashboards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-16">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <FileText className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm font-medium text-red-700">{error}</p>
      </div>
    );
  }

  if (dashboards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
          <LayoutDashboard className="h-10 w-10 text-blue-500" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">No dashboards yet</h3>
        <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-500">
          Create your first dashboard to visualize your data. You can build one from scratch or auto-generate it from any database table.
        </p>
        <div className="flex items-center gap-3">
          <a
            href="/vizora/dashboards/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Create Dashboard
          </a>
          <span className="text-sm font-medium text-slate-400">or</span>
          <button
            onClick={() => {
              const btn = document.querySelector('[data-auto-generate]') as HTMLElement;
              btn?.click();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
          >
            Auto-generate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="relative">
          <SortAsc className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="updated-desc">Recently updated</option>
            <option value="updated-asc">Least recently updated</option>
            <option value="created-desc">Recently created</option>
            <option value="created-asc">Least recently created</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-slate-500">
          {filteredDashboards.length} result{filteredDashboards.length !== 1 ? 's' : ''} found
        </p>
      )}

      {filteredDashboards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-1 text-lg font-bold text-slate-900">No results found</h3>
          <p className="text-sm text-slate-500">
            No dashboards match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              {/* Card Header Gradient */}
              <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="flex flex-1 flex-col p-5">
                {/* Title */}
                <div className="mb-3">
                  <h3 className="truncate text-[15px] font-bold text-slate-900">
                    {dashboard.name}
                  </h3>
                  {dashboard.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {dashboard.description}
                    </p>
                  )}
                </div>

                {/* Meta */}
                <div className="mb-4 flex items-center gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">
                    <FileText className="h-3 w-3" />
                    {dashboard.config.pages.length} page{dashboard.config.pages.length !== 1 ? 's' : ''}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <RelativeTime date={dashboard.updatedAt} />
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-1 border-t border-slate-100 pt-3">
                  <a
                    href={`/vizora/dashboards/${dashboard.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(dashboard.id)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(dashboard.id)}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete dashboard"
        description="Are you sure you want to delete this dashboard? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
      />
    </div>
  );
}
