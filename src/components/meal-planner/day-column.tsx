"use client";

import type { MealPlanSlot, Recipe, DayOfWeek } from "@/types";
import { MealSlot } from "./meal-slot";
import { MEAL_TYPES, MEAL_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DayColumnProps {
  dayName: string;
  dayOfWeek: DayOfWeek;
  date: Date;
  isToday: boolean;
  slots: MealPlanSlot[];
  mealPlanId: string;
  recipes: Recipe[];
}

export function DayColumn({
  dayName,
  dayOfWeek,
  date,
  isToday,
  slots,
  mealPlanId,
  recipes,
}: DayColumnProps) {
  return (
    <div
      className={cn(
        "min-w-[160px] flex-shrink-0 rounded-xl p-4 md:min-w-0 transition-all",
        isToday
          ? "bg-card border border-primary/30 bg-primary/5"
          : "bg-card border border-border"
      )}
    >
      <div className="mb-4 text-center">
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-wider text-muted-foreground",
            isToday && "text-primary"
          )}
        >
          {dayName}
        </p>
        <p
          className={cn(
            "text-lg font-semibold",
            isToday && "text-primary"
          )}
        >
          {date.getDate()}
        </p>
      </div>

      <div className="space-y-2">
        {MEAL_TYPES.map((mealType) => {
          const slot = slots.find((s) => s.meal_type === mealType);
          return (
            <MealSlot
              key={mealType}
              mealType={mealType}
              label={MEAL_TYPE_LABELS[mealType]}
              slot={slot}
              mealPlanId={mealPlanId}
              dayOfWeek={dayOfWeek}
              recipes={recipes}
            />
          );
        })}
      </div>
    </div>
  );
}
