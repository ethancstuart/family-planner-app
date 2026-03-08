"use client";

import { useState } from "react";
import type { Recipe } from "@/types";
import { RecipeCard } from "./recipe-card";
import { AddRecipeButton } from "./add-recipe-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UtensilsCrossed, X } from "lucide-react";

interface RecipeListProps {
  recipes: Recipe[];
}

export function RecipeList({ recipes }: RecipeListProps) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(recipes.flatMap((r) => r.tags))
  ).sort();

  const filtered = recipes.filter((r) => {
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.ingredients.some((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      );
    const matchesTag = !activeTag || r.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 px-6 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <UtensilsCrossed className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Your recipe vault is empty</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Paste a TikTok link, drop in a recipe URL, snap a photo, or type one
          from memory. Your AI-powered vault starts here.
        </p>
        <div className="mt-6">
          <AddRecipeButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recipes, ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeTag && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => setActiveTag(null)}
            >
              Clear
              <X className="h-3 w-3" />
            </Badge>
          )}
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={activeTag === tag ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filtered.length === 0 && recipes.length > 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No recipes match your search.</p>
          <button
            onClick={() => {
              setSearch("");
              setActiveTag(null);
            }}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
