import { cn } from '@/lib/utils';

type WidgetSkeletonProps = {
  className?: string;
  variant?: 'chart' | 'table' | 'kpi' | 'default';
};

export function WidgetSkeleton({ className, variant = 'default' }: WidgetSkeletonProps) {
  return (
    <div className={cn('flex h-full min-h-[120px] flex-col gap-3 rounded-xl border border-border bg-card p-4', className)}>
      <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      {variant === 'kpi' ? (
        <>
          <div className="mt-2 h-10 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        </>
      ) : variant === 'chart' ? (
        <div className="flex flex-1 items-end gap-2 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 animate-pulse rounded-t bg-muted"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      ) : variant === 'table' ? (
        <div className="flex flex-1 flex-col gap-2 pt-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-3 w-full animate-pulse rounded bg-muted/60" />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 pt-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted/60" />
        </div>
      )}
    </div>
  );
}
