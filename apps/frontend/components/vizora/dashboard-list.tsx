'use client';

import { useEffect, useState } from 'react';
import { listDashboards, deleteDashboard, duplicateDashboard } from '@/lib/vizora/dashboard-api';
import { cn } from '@/lib/utils';
import { Edit, Trash2, Copy, LayoutDashboard, Loader2 } from 'lucide-react';
import type { DashboardDTO } from '@/lib/vizora/types';

export default function DashboardList() {
  const [dashboards, setDashboards] = useState<DashboardDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDashboards()
      .then((data) => setDashboards(data.dashboards ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboards'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return;
    try {
      await deleteDashboard(id);
      setDashboards((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete dashboard');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await duplicateDashboard(id);
      setDashboards((prev) => [...prev, duplicated]);
    } catch (err) {
      console.error('Duplicate failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to duplicate dashboard');
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {dashboards.map((dashboard) => (
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
            <span>{new Date(dashboard.updatedAt).toLocaleDateString()}</span>
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
              onClick={() => handleDelete(dashboard.id)}
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
  );
}

