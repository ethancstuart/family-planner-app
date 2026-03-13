export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <div className="h-8 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
        <div className="h-5 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3"
          >
            <div className="h-3 w-8 animate-pulse rounded bg-muted" />
            <div className="h-3 w-6 animate-pulse rounded bg-muted" />
            <div className="mt-2 space-y-1.5">
              <div className="h-8 w-full animate-pulse rounded bg-muted" />
              <div className="h-8 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
