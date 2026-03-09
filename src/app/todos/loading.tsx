export default function TodosLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-4 w-40 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-7 w-20 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>

      {/* List panels */}
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-8 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="border-t border-border px-5 py-4 space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-3 py-2">
                <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
