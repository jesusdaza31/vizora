'use client';

import { useEffect, useState, useMemo } from 'react';
import { listDashboards, deleteDashboard, duplicateDashboard } from '@/lib/vizora/dashboard-api';
import { cn } from '@/lib/utils';
import { Edit, Trash2, Copy, LayoutDashboard, Loader2, Search } from 'lucide-react';
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
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading dashboards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-16">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (dashboards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-16 shadow-soft">
        <LayoutDashboard className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No dashboards yet. Create your first dashboard to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="updated-desc">Recently updated</option>
          <option value="updated-asc">Least recently updated</option>
          <option value="created-desc">Recently created</option>
          <option value="created-asc">Least recently created</option>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
        </select>
      </div>

      {filteredDashboards.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-16 shadow-soft">
          <LayoutDashboard className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No dashboards match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-foreground">
                    {dashboard.name}
                  </h3>
                  {dashboard.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {dashboard.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{dashboard.config.pages.length} page{dashboard.config.pages.length !== 1 ? 's' : ''}</span>
                <span className="text-border">|</span>
                <RelativeTime date={dashboard.updatedAt} />
              </div>

              <div className="mt-auto flex items-center gap-1 border-t border-border pt-3">
                <a
                  href={`/vizora/dashboards/${dashboard.id}`}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
                    'text-foreground/70 transition-colors hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </a>
                <button
                  type="button"
                  onClick={() => handleDuplicate(dashboard.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
                    'text-foreground/70 transition-colors hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(dashboard.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ml-auto',
                    'text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive',
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
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
