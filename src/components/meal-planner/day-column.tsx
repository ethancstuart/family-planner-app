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
        "min-w-[160px] flex-shrink-0 rounded-xl p-3 md:min-w-0 transition-all",
        isToday
          ? "glass ring-1 ring-primary/30 shadow-[0_0_20px_-4px_oklch(0.72_0.19_25/0.2)] bg-gradient-to-b from-primary/8 to-transparent"
          : "glass-subtle md:opacity-80 md:hover:opacity-100"
      )}
    >
      <div className="mb-3 text-center">
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
