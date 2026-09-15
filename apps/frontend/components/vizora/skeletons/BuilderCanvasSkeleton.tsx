import { cn } from '@/lib/utils';

type BuilderCanvasSkeletonProps = {
  className?: string;
};

export function BuilderCanvasSkeleton({ className }: BuilderCanvasSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-12 gap-4 p-4', className)}>
      <div className="col-span-6 h-40 animate-pulse rounded-xl border border-border bg-muted/50" />
      <div className="col-span-6 h-40 animate-pulse rounded-xl border border-border bg-muted/50" />
      <div className="col-span-4 h-32 animate-pulse rounded-xl border border-border bg-muted/50" />
      <div className="col-span-8 h-32 animate-pulse rounded-xl border border-border bg-muted/50" />
      <div className="col-span-12 h-36 animate-pulse rounded-xl border border-border bg-muted/50" />
    </div>
  );
}
