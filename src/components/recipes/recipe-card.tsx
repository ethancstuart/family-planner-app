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

const gradientColors = [
  "from-orange-500/20 to-amber-500/10",
  "from-rose-500/20 to-pink-500/10",
  "from-blue-500/20 to-indigo-500/10",
  "from-emerald-500/20 to-teal-500/10",
  "from-violet-500/20 to-purple-500/10",
  "from-cyan-500/20 to-sky-500/10",
];

function getGradient(recipe: Recipe) {
  const sourceMap: Record<string, number> = { url: 0, video: 1, image: 2, manual: 3 };
  const idx = recipe.tags?.[0]
    ? recipe.tags[0].charCodeAt(0) % gradientColors.length
    : sourceMap[recipe.source_type] ?? 0;
  return gradientColors[idx];
}

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
  const SourceIcon = sourceIcons[recipe.source_type] ?? PenLine;
  const gradient = getGradient(recipe);

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Gradient header */}
      <div className={`relative h-10 rounded-t-xl bg-gradient-to-r ${gradient}`}>
        {recipe.is_favorite && (
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-card/90 shadow-sm">
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug group-hover:text-primary">
            {recipe.title}
          </h3>
          <SourceIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
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
      </div>
    </Link>
  );
}
