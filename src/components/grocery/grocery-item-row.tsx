"use client";

import type { GroceryItem } from "@/types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface GroceryItemRowProps {
  item: GroceryItem;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  large?: boolean;
}

export function GroceryItemRow({
  item,
  onToggle,
  onDelete,
  large = false,
}: GroceryItemRowProps) {
  const quantityLabel = [
    item.quantity != null ? item.quantity : null,
    item.unit,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border px-3 transition-colors",
        large ? "py-4" : "py-2.5",
        item.checked && "border-transparent"
      )}
    >
      <button
        onClick={() => onToggle(item.id, !item.checked)}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md border-2 transition-colors",
          large ? "h-6 w-6" : "h-5 w-5",
          item.checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 hover:border-primary"
        )}
        aria-label={item.checked ? "Uncheck item" : "Check item"}
      >
        {item.checked && (
          <svg
            className={cn(large ? "h-4 w-4" : "h-3 w-3")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-medium",
            large ? "text-base" : "text-sm",
            item.checked && "text-muted-foreground line-through"
          )}
        >
          {item.name}
        </p>
        {quantityLabel && (
          <p className="text-xs text-muted-foreground">{quantityLabel}</p>
        )}
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="hidden shrink-0 text-muted-foreground transition-colors hover:text-destructive group-hover:block"
        aria-label="Delete item"
      >
        <X className={cn(large ? "h-5 w-5" : "h-4 w-4")} />
      </button>
    </motion.div>
  );
}
