"use client";

import type { MealPlanSlot, Recipe, DayOfWeek } from "@/types";
import { DayColumn } from "./day-column";
import { DAYS_OF_WEEK_SHORT } from "@/lib/constants";
import { parseDate } from "@/lib/utils";

interface WeekViewProps {
  weekStart: string;
  mealPlanId: string;
  slots: MealPlanSlot[];
  recipes: Recipe[];
}

export function WeekView({
  weekStart,
  mealPlanId,
  slots,
  recipes,
}: WeekViewProps) {
  const startDate = parseDate(weekStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-7 md:overflow-visible">
      {DAYS_OF_WEEK_SHORT.map((dayName, index) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + index);
        const isToday = date.getTime() === today.getTime();
        const daySlots = slots.filter(
          (s) => s.day_of_week === (index as DayOfWeek)
        );

        return (
          <DayColumn
            key={index}
            dayName={dayName}
            dayOfWeek={index as DayOfWeek}
            date={date}
            isToday={isToday}
            slots={daySlots}
            mealPlanId={mealPlanId}
            recipes={recipes}
          />
        );
      })}
    </div>
  );
}
