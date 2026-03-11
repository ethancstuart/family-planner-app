"use client";

import { useDraggable } from "@dnd-kit/core";
import type { MealPlanSlot, Recipe, DayOfWeek, MealType } from "@/types";
import { MealSlotCard } from "./meal-slot-card";

interface DraggableMealCardProps {
  slot: MealPlanSlot;
  label: string;
  mealPlanId: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipes: Recipe[];
}

export function DraggableMealCard({
  slot,
  label,
  mealPlanId,
  dayOfWeek,
  mealType,
  recipes,
}: DraggableMealCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: slot.id,
      data: { slot },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? "opacity-40" : ""}
    >
      <MealSlotCard
        slot={slot}
        label={label}
        mealPlanId={mealPlanId}
        dayOfWeek={dayOfWeek}
        mealType={mealType}
        recipes={recipes}
        isDragging={isDragging}
      />
    </div>
  );
}
