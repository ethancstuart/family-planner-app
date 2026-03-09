export default function RecipesLoading() {
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />

      {/* Recipe card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-border bg-card p-5"
          >
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            <div className="mt-3 space-y-2">
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
            <div className="mt-4 flex gap-4">
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
