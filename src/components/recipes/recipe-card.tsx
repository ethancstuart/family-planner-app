"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Recipe } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Users, Link2, Video, Camera, PenLine, Compass } from "lucide-react";

const sourceIcons: Record<string, typeof PenLine> = {
  url: Link2,
  video: Video,
  image: Camera,
  manual: PenLine,
  spoonacular: Compass,
};

const gradientColors = [
  "from-purple-500/20 to-violet-500/8",
  "from-violet-500/20 to-indigo-500/8",
  "from-indigo-500/20 to-blue-500/8",
  "from-teal-500/20 to-emerald-500/8",
  "from-fuchsia-500/20 to-pink-500/8",
  "from-sky-500/20 to-cyan-500/8",
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
  layout?: "grid" | "list";
}

export const RecipeCard = memo(function RecipeCard({ recipe, layout = "grid" }: RecipeCardProps) {
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
  const SourceIcon = sourceIcons[recipe.source_type] ?? PenLine;
  const gradient = getGradient(recipe);

  if (layout === "list") {
    return (
      <Link
        href={`/recipes/${recipe.id}`}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary"
      >
        {/* Thumbnail */}
        <div className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg ${!recipe.image_url ? `bg-gradient-to-r ${gradient}` : ""}`}>
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : null}
          {recipe.is_favorite && (
            <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-card/90">
              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
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
            {recipe.tags.length > 0 && (
              <span>{recipe.tags[0]}</span>
            )}
          </div>
        </div>

        <SourceIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </Link>
    );
  }

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card transition-colors hover:border-primary"
    >
      {/* Image or gradient header */}
      <div className={`relative h-32 rounded-t-xl overflow-hidden ${!recipe.image_url ? `bg-gradient-to-r ${gradient}` : ""}`}>
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />
        {recipe.is_favorite && (
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-card/90 shadow-sm">
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 pt-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
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
            <div className="mt-4 flex flex-wrap gap-1.5">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="glow" className="text-[10px] px-2 py-0">
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
});
