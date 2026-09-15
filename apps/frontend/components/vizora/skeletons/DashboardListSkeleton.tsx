export function DashboardListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="h-2 bg-slate-100" />
          <div className="flex flex-1 flex-col p-5">
            <div className="mb-3">
              <div className="h-5 w-3/4 animate-pulse rounded-lg bg-slate-200" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
            </div>
            <div className="mb-4 flex gap-2">
              <div className="h-5 w-16 animate-pulse rounded-md bg-slate-100" />
              <div className="h-5 w-20 animate-pulse rounded-md bg-slate-100" />
            </div>
            <div className="mt-auto flex gap-1 border-t border-slate-100 pt-3">
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
