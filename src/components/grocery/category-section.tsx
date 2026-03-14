"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  "Produce": "border-l-emerald-500",
  "Dairy & Eggs": "border-l-amber-500",
  "Meat & Seafood": "border-l-rose-500",
  "Bakery": "border-l-orange-500",
  "Pantry": "border-l-yellow-600",
  "Frozen": "border-l-sky-500",
  "Beverages": "border-l-blue-500",
  "Snacks": "border-l-violet-500",
  "Condiments & Sauces": "border-l-fuchsia-500",
  "Spices & Seasonings": "border-l-teal-500",
  "Canned Goods": "border-l-slate-400",
  "Grains & Pasta": "border-l-amber-600",
};

interface CategorySectionProps {
  category: string;
  children: React.ReactNode;
}

export function CategorySection({ category, children }: CategorySectionProps) {
  const [open, setOpen] = useState(true);
  const borderColor = categoryColors[category] ?? "border-l-muted-foreground";

  return (
    <div className={cn("border-l-2 pl-3", borderColor)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            !open && "-rotate-90"
          )}
        />
        {category}
      </button>
      {open && <div className="mt-1 space-y-1">{children}</div>}
    </div>
  );
}
