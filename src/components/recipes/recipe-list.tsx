"use client";

import { useState, useMemo } from "react";
import type { Recipe } from "@/types";
import { RecipeCard } from "./recipe-card";
import { AddRecipeButton } from "./add-recipe-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UtensilsCrossed, X, LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

interface RecipeListProps {
  recipes: Recipe[];
}

export function RecipeList({ recipes }: RecipeListProps) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const allTags = useMemo(
    () => Array.from(new Set(recipes.flatMap((r) => r.tags))).sort(),
    [recipes]
  );

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
      {/* Sticky search/filter bar */}
      <div className="sticky top-14 z-10 -mx-4 bg-background/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
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
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
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

      <motion.div
        className={viewMode === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        key={search + activeTag + viewMode}
      >
        {filtered.map((recipe) => (
          <motion.div
            key={recipe.id}
            variants={staggerItem}
            className={viewMode === "grid" && recipe.is_favorite ? "sm:col-span-2" : ""}
          >
            <RecipeCard recipe={recipe} layout={viewMode} />
          </motion.div>
        ))}
      </motion.div>

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
