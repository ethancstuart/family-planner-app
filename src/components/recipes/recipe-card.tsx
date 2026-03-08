"use client";

import Link from "next/link";
import type { Recipe } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Users } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold leading-snug group-hover:text-primary">
          {recipe.title}
        </h3>
        {recipe.is_favorite && (
          <Heart className="h-4 w-4 shrink-0 fill-red-500 text-red-500" />
        )}
      </div>

      {recipe.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {recipe.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        {totalTime > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {totalTime} min
          </span>
        )}
        {recipe.servings && (
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {recipe.servings} servings
          </span>
        )}
      </div>

      {recipe.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {recipe.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{recipe.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </Link>
  );
}
