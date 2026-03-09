import { EmptyState } from "@/components/ui/empty-state";
import { CalendarDays } from "lucide-react";

export function EmptyMealPlan() {
  return (
    <EmptyState
      icon={CalendarDays}
      title="Plan your first week"
      description="Add recipes to your vault first, then come back to plan your meals for the week. Tap any slot to assign a recipe."
      actionLabel="Go to Recipes"
      actionHref="/recipes"
    />
  );
}
