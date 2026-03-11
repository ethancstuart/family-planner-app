"use client";

import { useState } from "react";
import type { MealPlanSlot, Recipe, DayOfWeek, MealType } from "@/types";
import { DraggableMealCard } from "./draggable-meal-card";
import { DroppableSlot } from "./droppable-slot";
import { AddMealDialog } from "./add-meal-dialog";
import { Plus } from "lucide-react";

interface MealSlotProps {
  mealType: MealType;
  label: string;
  slot?: MealPlanSlot;
  mealPlanId: string;
  dayOfWeek: DayOfWeek;
  recipes: Recipe[];
}

export function MealSlot({
  mealType,
  label,
  slot,
  mealPlanId,
  dayOfWeek,
  recipes,
}: MealSlotProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const droppableId = `${dayOfWeek}-${mealType}`;

  if (slot?.recipe) {
    return (
      <DroppableSlot id={droppableId}>
        <DraggableMealCard
          slot={slot}
          label={label}
          mealPlanId={mealPlanId}
          dayOfWeek={dayOfWeek}
          mealType={mealType}
          recipes={recipes}
        />
      </DroppableSlot>
    );
  }

  return (
    <DroppableSlot id={droppableId}>
      <button
        onClick={() => setDialogOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border p-2 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>{label}</span>
      </button>

      <AddMealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mealPlanId={mealPlanId}
        dayOfWeek={dayOfWeek}
        mealType={mealType}
        recipes={recipes}
      />
    </DroppableSlot>
  );
}
