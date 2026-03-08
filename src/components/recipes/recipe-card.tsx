"use client";

import Link from "next/link";
import type { Recipe } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Users, Link2, Video, Camera, PenLine } from "lucide-react";

const sourceIcons = {
  url: Link2,
  video: Video,
  image: Camera,
  manual: PenLine,
};

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
  const SourceIcon = sourceIcons[recipe.source_type] ?? PenLine;

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug group-hover:text-primary">
          {recipe.title}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          {recipe.is_favorite && (
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          )}
          <SourceIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {recipe.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {recipe.description}
        </p>
      )}

      <div className="mt-auto pt-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {totalTime}m
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {recipe.servings}
            </span>
          )}
          {recipe.ingredients.length > 0 && (
            <span>{recipe.ingredients.length} ingredients</span>
          )}
        </div>

        {recipe.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recipe.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                +{recipe.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
