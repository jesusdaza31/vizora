import Link from 'next/link';
import {
  LayoutDashboard,
  Plus,
  PanelLeft,
  SearchX,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  className?: string;
};

export function NoDashboardsEmptyState({ className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-16 shadow-soft', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <LayoutDashboard className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-foreground">No dashboards yet</h3>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Create your first dashboard to start building data-driven visualizations.
        </p>
      </div>
      <Link
        href="/vizora/dashboards/new"
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="h-3.5 w-3.5" />
        Create Dashboard
      </Link>
    </div>
  );
}

export function NoComponentsEmptyState({ className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-8', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <PanelLeft className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">No components on this page</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add components from the panel on the left
        </p>
      </div>
    </div>
  );
}

export function NoDataEmptyState({ className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-8', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">No data matches current filters</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your filters or data source configuration
        </p>
      </div>
    </div>
  );
}

export function NoTablesEmptyState({ className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-8', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Database className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">No data sources configured</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Connect a data source to start building widgets
        </p>
      </div>
    </div>
  );
}
