export default function MealPlannerLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
      </div>

      {/* Week navigator skeleton */}
      <div className="flex items-center justify-center gap-4">
        <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-border p-3">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="h-16 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
