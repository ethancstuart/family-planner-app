export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-8 w-28 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-muted" />
      </div>

      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  );
}
