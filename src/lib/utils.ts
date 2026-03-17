import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export {
  getWeekStartDate,
  formatDate,
  parseDate,
  parseGroceryInput,
} from "@family-planner/shared";
