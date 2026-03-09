"use client";

import { cn } from "@/lib/utils";

const filters = [
  { key: "all", label: "All" },
  { key: "mine", label: "My Tasks" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Completed" },
];

interface TodoFiltersProps {
  active: string;
  onChange: (filter: string) => void;
}

export function TodoFilters({ active, onChange }: TodoFiltersProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            active === f.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
