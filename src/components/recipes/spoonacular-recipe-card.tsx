"use client";

/* eslint-disable @next/next/no-img-element */
import type { SpoonacularSearchResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Check } from "lucide-react";

interface SpoonacularRecipeCardProps {
  result: SpoonacularSearchResult;
  isSaved: boolean;
  onClick: () => void;
}

export function SpoonacularRecipeCard({
  result,
  isSaved,
  onClick,
}: SpoonacularRecipeCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-xl border border-border bg-card text-left transition-colors hover:border-primary"
    >
      {result.image ? (
        <div className="relative h-40 overflow-hidden rounded-t-xl">
          <img
            src={result.image}
            alt={result.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {isSaved && (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
              <Check className="h-3 w-3" />
              Saved
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex h-40 items-center justify-center rounded-t-xl bg-gradient-to-r from-primary/20 to-primary/5">
          <span className="text-2xl">🍽️</span>
          {isSaved && (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
              <Check className="h-3 w-3" />
              Saved
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary">
          {result.title}
        </h3>

        <div className="mt-auto pt-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {result.readyInMinutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {result.readyInMinutes}m
              </span>
            )}
            {result.servings > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {result.servings}
              </span>
            )}
          </div>

          {(result.cuisines?.length > 0 || result.diets?.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {[...(result.cuisines ?? []), ...(result.diets ?? [])]
                .slice(0, 3)
                .map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] px-2 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
