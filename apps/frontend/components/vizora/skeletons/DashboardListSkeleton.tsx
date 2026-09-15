export function DashboardListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          <div className="mt-auto flex gap-2 border-t border-border pt-3">
            <div className="h-7 w-16 animate-pulse rounded-lg bg-muted" />
            <div className="h-7 w-20 animate-pulse rounded-lg bg-muted" />
            <div className="ml-auto h-7 w-16 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
