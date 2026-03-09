"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Recipe, DayOfWeek, MealType } from "@/types";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Users } from "lucide-react";
import { MEAL_TYPE_LABELS, DAYS_OF_WEEK } from "@/lib/constants";
import { toast } from "sonner";

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlanId: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipes: Recipe[];
}

export function AddMealDialog({
  open,
  onOpenChange,
  mealPlanId,
  dayOfWeek,
  mealType,
  recipes,
}: AddMealDialogProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  const filtered = recipes.filter(
    (r) =>
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = async (recipe: Recipe) => {
    setAdding(recipe.id);
    const supabase = createClient();

    const { error } = await supabase.from("meal_plan_slots").insert({
      meal_plan_id: mealPlanId,
      recipe_id: recipe.id,
      day_of_week: dayOfWeek,
      meal_type: mealType,
    });

    if (error) {
      toast.error("Failed to add meal");
      setAdding(null);
    } else {
      setSearch("");
      onOpenChange(false);
      setAdding(null);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add {MEAL_TYPE_LABELS[mealType]}
          </DialogTitle>
          <DialogDescription>
            {DAYS_OF_WEEK[dayOfWeek]} — pick a recipe from your vault.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="max-h-[300px] space-y-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {recipes.length === 0
                ? "No recipes yet. Add some first!"
                : "No recipes match your search."}
            </p>
          ) : (
            filtered.map((recipe) => {
              const totalTime =
                (recipe.prep_time_minutes ?? 0) +
                (recipe.cook_time_minutes ?? 0);
              const isAdding = adding === recipe.id;

              return (
                <button
                  key={recipe.id}
                  onClick={() => handleSelect(recipe)}
                  disabled={isAdding}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">
                      {recipe.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      {totalTime > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {totalTime}m
                        </span>
                      )}
                      {recipe.servings && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {recipe.servings}
                        </span>
                      )}
                    </div>
                    {recipe.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {recipe.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="px-1.5 py-0 text-[10px]"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
