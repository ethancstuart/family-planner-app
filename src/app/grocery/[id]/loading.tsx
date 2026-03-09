export default function GroceryListLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border p-3"
          >
            <div className="h-5 w-5 animate-pulse rounded bg-muted" />
            <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
