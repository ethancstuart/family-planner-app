"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { MealPlanSlot, Recipe, DayOfWeek, MealType } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { X, Clock, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AddMealDialog } from "./add-meal-dialog";

interface MealSlotCardProps {
  slot: MealPlanSlot;
  label: string;
  mealPlanId: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipes: Recipe[];
  isDragging?: boolean;
}

const mealTypeGradients: Record<string, string> = {
  breakfast: "from-amber-400 to-orange-400",
  lunch: "from-green-400 to-emerald-400",
  dinner: "from-rose-400 to-primary",
  snack: "from-violet-400 to-accent",
};

export function MealSlotCard({ slot, label, mealPlanId, dayOfWeek, mealType, recipes, isDragging }: MealSlotCardProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const recipe = slot.recipe!;
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("meal_plan_slots")
      .delete()
      .eq("id", slot.id);

    if (error) {
      toast.error("Failed to remove meal");
      setRemoving(false);
    } else {
      router.refresh();
    }
  };

  return (
    <div className={cn("group relative", isDragging && "shadow-lg")}>
      <Link
        href={`/recipes/${recipe.id}`}
        className="block rounded-lg border border-white/[0.06] bg-card p-2 transition-all hover:border-primary/30 hover:scale-[1.02] relative overflow-hidden"
      >
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg bg-gradient-to-b ${mealTypeGradients[mealType] ?? "from-primary to-accent"}`} />
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-xs font-medium leading-snug line-clamp-2">
          {recipe.title}
        </p>
        {totalTime > 0 && (
          <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            {totalTime}m
          </div>
        )}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSwapOpen(true);
        }}
        className="absolute -left-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-opacity group-hover:flex"
        aria-label="Swap meal"
      >
        <ArrowLeftRight className="h-3 w-3" />
      </button>
      <button
        onClick={handleRemove}
        disabled={removing}
        className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-opacity group-hover:flex"
        aria-label="Remove meal"
      >
        <X className="h-3 w-3" />
      </button>
      <AddMealDialog
        open={swapOpen}
        onOpenChange={setSwapOpen}
        mealPlanId={mealPlanId}
        dayOfWeek={dayOfWeek}
        mealType={mealType}
        recipes={recipes}
        existingSlotId={slot.id}
        currentRecipeId={slot.recipe_id}
      />
    </div>
  );
}
