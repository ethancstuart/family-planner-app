"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Clock, Users, Save, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Ingredient } from "@/types";

interface RecipeDetail {
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  source_url: string | null;
  source_type: "spoonacular";
  image_url: string | null;
  is_favorite: boolean;
  spoonacular_id: number;
}

interface SpoonacularPreviewDialogProps {
  spoonacularId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (spoonacularId: number) => void;
}

export function SpoonacularPreviewDialog({
  spoonacularId,
  open,
  onOpenChange,
  onSaved,
}: SpoonacularPreviewDialogProps) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchRecipe = useCallback(async (id: number) => {
    setLoading(true);
    setRecipe(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/recipes/spoonacular/${id}`);
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        onOpenChange(false);
      } else {
        setRecipe(data.recipe);
      }
    } catch {
      toast.error("Failed to load recipe");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [onOpenChange]);

  useEffect(() => {
    if (open) fetchRecipe(spoonacularId);
  }, [open, spoonacularId, fetchRecipe]);

  const handleSave = async () => {
    if (!recipe) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!membership) return;

    const { error } = await supabase.from("recipes").insert({
      household_id: membership.household_id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tags: recipe.tags,
      prep_time_minutes: recipe.prep_time_minutes,
      cook_time_minutes: recipe.cook_time_minutes,
      servings: recipe.servings,
      source_url: recipe.source_url,
      source_type: "spoonacular",
      image_url: recipe.image_url,
      spoonacular_id: recipe.spoonacular_id,
      created_by: user.id,
    });

    setSaving(false);

    if (error) {
      if (error.code === "23505") {
        toast.info("This recipe is already in your vault");
        setSaved(true);
      } else {
        toast.error("Failed to save recipe");
      }
    } else {
      toast.success("Recipe saved to your vault!");
      setSaved(true);
      onSaved(spoonacularId);
      router.refresh();
    }
  };

  const totalTime =
    (recipe?.prep_time_minutes ?? 0) + (recipe?.cook_time_minutes ?? 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        ) : recipe ? (
          <>
            <DialogHeader>
              <DialogTitle className="leading-snug">{recipe.title}</DialogTitle>
            </DialogHeader>

            {recipe.image_url && (
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                <Image
                  src={recipe.image_url}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 448px"
                />
              </div>
            )}

            {recipe.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {recipe.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {totalTime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {totalTime}m
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {recipe.servings} servings
                </span>
              )}
            </div>

            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {recipe.ingredients.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Ingredients</h4>
                <ul className="space-y-1">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {[ing.quantity, ing.unit, ing.name]
                        .filter(Boolean)
                        .join(" ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recipe.steps.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Instructions</h4>
                <ol className="space-y-2">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saving || saved}
              className="w-full"
            >
              {saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved to Vault
                </>
              ) : saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save to Vault
                </>
              )}
            </Button>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
