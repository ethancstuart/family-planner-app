"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { MealPlanSlot, Recipe, DayOfWeek, MealType } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { X, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MealSlotCardProps {
  slot: MealPlanSlot;
  label: string;
  mealPlanId: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipes: Recipe[];
}

const mealTypeColors: Record<string, string> = {
  breakfast: "border-l-amber-400",
  lunch: "border-l-green-400",
  dinner: "border-l-orange-400",
  snack: "border-l-purple-400",
};

export function MealSlotCard({ slot, label, mealType }: MealSlotCardProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
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
    <div className="group relative">
      <Link
        href={`/recipes/${recipe.id}`}
        className={cn(
          "block rounded-lg border border-border border-l-2 bg-card p-2 transition-all hover:border-primary/30 hover:scale-[1.02]",
          mealTypeColors[mealType]
        )}
      >
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
        onClick={handleRemove}
        disabled={removing}
        className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-opacity group-hover:flex"
        aria-label="Remove meal"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
