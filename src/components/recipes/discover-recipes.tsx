"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { SpoonacularSearchResult } from "@/types";
import { SpoonacularRecipeCard } from "./spoonacular-recipe-card";
import { SpoonacularPreviewDialog } from "./spoonacular-preview-dialog";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

const CUISINES = ["Italian", "Mexican", "Asian", "American", "Mediterranean"];
const DIETS = ["Vegetarian", "Vegan", "Gluten Free"];

interface DiscoverRecipesProps {
  savedSpoonacularIds: number[];
}

export function DiscoverRecipes({ savedSpoonacularIds }: DiscoverRecipesProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [results, setResults] = useState<SpoonacularSearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(
    new Set(savedSpoonacularIds)
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch results when search/filters change
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    const doSearch = async () => {
      setLoading(true);
      setOffset(0);

      try {
        const res = await fetch("/api/recipes/spoonacular/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: debouncedSearch,
            cuisine: cuisine || undefined,
            diet: diet || undefined,
            offset: 0,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Search failed");
          setResults([]);
        } else {
          setResults(data.results);
          setTotalResults(data.totalResults);
        }
      } catch {
        toast.error("Search failed");
      } finally {
        setLoading(false);
      }
    };

    doSearch();
  }, [debouncedSearch, cuisine, diet]);

  const loadMore = async () => {
    const newOffset = offset + 12;
    setLoadingMore(true);

    try {
      const res = await fetch("/api/recipes/spoonacular/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: debouncedSearch,
          cuisine: cuisine || undefined,
          diet: diet || undefined,
          offset: newOffset,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResults((prev) => [...prev, ...data.results]);
        setOffset(newOffset);
      }
    } catch {
      toast.error("Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSaved = (spoonacularId: number) => {
    setSavedIds((prev) => new Set([...prev, spoonacularId]));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search recipes... (e.g. chicken tacos, pasta, smoothie)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          autoFocus
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {CUISINES.map((c) => (
          <Badge
            key={c}
            variant={cuisine === c ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setCuisine(cuisine === c ? null : c)}
          >
            {c}
          </Badge>
        ))}
        <span className="mx-1 self-center text-xs text-muted-foreground">|</span>
        {DIETS.map((d) => (
          <Badge
            key={d}
            variant={diet === d ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setDiet(diet === d ? null : d)}
          >
            {d}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            {totalResults} results found
          </p>
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            key={debouncedSearch + cuisine + diet}
          >
            {results.map((result) => (
              <motion.div key={result.id} variants={staggerItem}>
                <SpoonacularRecipeCard
                  result={result}
                  isSaved={savedIds.has(result.id)}
                  onClick={() => setPreviewId(result.id)}
                />
              </motion.div>
            ))}
          </motion.div>

          {results.length < totalResults && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </>
      ) : debouncedSearch.trim() ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No recipes found for &ldquo;{debouncedSearch}&rdquo;</p>
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Start typing to discover recipes from around the world.
          </p>
        </div>
      )}

      {previewId !== null && (
        <SpoonacularPreviewDialog
          spoonacularId={previewId}
          open={previewId !== null}
          onOpenChange={(open) => {
            if (!open) setPreviewId(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
