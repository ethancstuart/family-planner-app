"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Heart,
  Clock,
  Users,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(recipe.is_favorite);
  const [deleting, setDeleting] = useState(false);

  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  const toggleFavorite = async () => {
    const supabase = createClient();
    const next = !isFavorite;
    setIsFavorite(next);
    await supabase
      .from("recipes")
      .update({ is_favorite: next })
      .eq("id", recipe.id);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this recipe?")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("recipes").delete().eq("id", recipe.id);
    router.push("/recipes");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/recipes")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to recipes
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleFavorite}>
            <Heart
              className={`h-4 w-4 ${
                isFavorite ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{recipe.title}</h1>
        {recipe.description && (
          <p className="mt-2 text-muted-foreground">{recipe.description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {recipe.prep_time_minutes && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {recipe.prep_time_minutes}m prep
          </span>
        )}
        {recipe.cook_time_minutes && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {recipe.cook_time_minutes}m cook
          </span>
        )}
        {totalTime > 0 && (
          <span className="font-medium text-foreground">
            {totalTime}m total
          </span>
        )}
        {recipe.servings && (
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {recipe.servings} servings
          </span>
        )}
      </div>

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {recipe.source_url && (
        <a
          href={recipe.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View original source
        </a>
      )}

      {/* Ingredients */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li
              key={i}
              className="flex items-baseline gap-2 text-sm"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(" ")}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Instructions</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {i + 1}
              </span>
              <p className="pt-0.5 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
