"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Heart,
  Clock,
  Users,
  Trash2,
  ExternalLink,
  Link2,
  Video,
  Camera,
  PenLine,
} from "lucide-react";

const sourceLabels: Record<string, { icon: typeof Link2; label: string }> = {
  url: { icon: Link2, label: "Imported from URL" },
  video: { icon: Video, label: "Imported from video" },
  image: { icon: Camera, label: "Imported from photo" },
  manual: { icon: PenLine, label: "Added manually" },
};

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(recipe.is_favorite);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
  const source = sourceLabels[recipe.source_type] ?? sourceLabels.manual;
  const SourceIcon = source.icon;

  const toggleFavorite = async () => {
    const next = !isFavorite;
    setIsFavorite(next);
    const supabase = createClient();
    const { error } = await supabase
      .from("recipes")
      .update({ is_favorite: next })
      .eq("id", recipe.id);

    if (error) {
      setIsFavorite(!next);
      toast.error("Failed to update favorite");
    } else {
      toast.success(next ? "Added to favorites" : "Removed from favorites");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("recipes").delete().eq("id", recipe.id);

    if (error) {
      setDeleting(false);
      toast.error("Failed to delete recipe");
    } else {
      toast.success("Recipe deleted");
      router.push("/recipes");
      router.refresh();
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/recipes")}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Recipes
        </button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className="h-9 w-9"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorite ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDelete(true)}
            className="h-9 w-9 text-destructive hover:text-destructive"
            aria-label="Delete recipe"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Title & meta */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {recipe.title}
        </h1>
        {recipe.description && (
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {recipe.description}
          </p>
        )}
      </div>

      {/* Stats bar */}
      <div className="glass-subtle flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg px-4 py-3 text-sm">
        {recipe.prep_time_minutes && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {recipe.prep_time_minutes}m prep
          </span>
        )}
        {recipe.cook_time_minutes && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {recipe.cook_time_minutes}m cook
          </span>
        )}
        {totalTime > 0 && (
          <span className="font-medium">{totalTime}m total</span>
        )}
        {recipe.servings && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            {recipe.servings} servings
          </span>
        )}
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <SourceIcon className="h-3.5 w-3.5" />
          {source.label}
        </span>
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Source link */}
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
        <h2 className="mb-4 text-lg font-semibold">
          Ingredients
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({recipe.ingredients.length})
          </span>
        </h2>
        <ul className="space-y-2.5">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-baseline gap-3 text-sm">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent" />
              <span>
                {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(" ")}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Instructions</h2>
        <ol className="space-y-5">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-4 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <p className="pt-1 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete recipe?</DialogTitle>
            <DialogDescription>
              &ldquo;{recipe.title}&rdquo; will be permanently removed. This
              can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
