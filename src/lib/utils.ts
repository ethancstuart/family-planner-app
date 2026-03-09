import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the start of the week (Sunday) for a given date.
 * Returns YYYY-MM-DD string.
 */
export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return formatDate(d);
}

/**
 * Format a Date to YYYY-MM-DD string.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object (local timezone).
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Parse a quick-add grocery input like "2 lbs chicken breast"
 * Returns { quantity, unit, name }
 */
export function parseGroceryInput(input: string): {
  quantity: number | null;
  unit: string | null;
  name: string;
} {
  const trimmed = input.trim();
  const units = [
    "lbs", "lb", "oz", "cups", "cup", "tbsp", "tsp",
    "gallon", "gallons", "quart", "quarts", "pint", "pints",
    "kg", "g", "ml", "l", "liters", "bunch", "bunches",
    "can", "cans", "bag", "bags", "box", "boxes", "pkg", "package",
    "dozen", "head", "cloves", "clove", "slices", "slice",
  ];

  const match = trimmed.match(
    /^(\d+(?:\.\d+)?)\s*((?:lbs?|oz|cups?|tbsp|tsp|gallons?|quarts?|pints?|kg|g|ml|l|liters?|bunch(?:es)?|cans?|bags?|box(?:es)?|pkg|packages?|dozen|heads?|cloves?|slices?)?)?\s*(.+)$/i
  );

  if (match) {
    const [, qty, unit, name] = match;
    const parsedUnit = unit?.trim().toLowerCase();
    return {
      quantity: parseFloat(qty),
      unit: parsedUnit && units.includes(parsedUnit) ? parsedUnit : null,
      name: parsedUnit && units.includes(parsedUnit) ? name.trim() : (unit ? `${unit} ${name}`.trim() : name.trim()),
    };
  }

  return { quantity: null, unit: null, name: trimmed };
}
