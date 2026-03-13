"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, X, Sparkles } from "lucide-react";
import type { Recipe } from "@/types";

type ExtractedRecipe = Omit<Recipe, "id" | "household_id" | "created_by" | "created_at" | "updated_at">;

interface RecipeReviewFormProps {
  recipe: ExtractedRecipe;
  onSave: (recipe: ExtractedRecipe) => Promise<void>;
  onBack: () => void;
}

export function RecipeReviewForm({ recipe, onSave, onBack }: RecipeReviewFormProps) {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description ?? "");
  const [prepTime, setPrepTime] = useState(recipe.prep_time_minutes?.toString() ?? "");
  const [cookTime, setCookTime] = useState(recipe.cook_time_minutes?.toString() ?? "");
  const [servings, setServings] = useState(recipe.servings?.toString() ?? "");
  const [tags, setTags] = useState<string[]>(recipe.tags);
  const [tagInput, setTagInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>(
    recipe.ingredients.map((i) =>
      [i.quantity, i.unit, i.name].filter(Boolean).join(" ")
    )
  );
  const [steps, setSteps] = useState<string[]>(recipe.steps);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setTagInput("");
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...recipe,
      title: title.trim(),
      description: description.trim() || null,
      prep_time_minutes: prepTime ? parseInt(prepTime) : null,
      cook_time_minutes: cookTime ? parseInt(cookTime) : null,
      servings: servings ? parseInt(servings) : null,
      tags,
      ingredients: ingredients
        .filter((i) => i.trim())
        .map((i) => ({ name: i.trim(), quantity: null, unit: null })),
      steps: steps.filter((s) => s.trim()),
    });
    setSaving(false);
  };

  return (
    <div className="space-y-4 pt-2">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
        <Sparkles className="h-4 w-4" />
        AI-extracted — review and edit before saving
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipe-title">Title</Label>
        <Input id="recipe-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipe-description">Description</Label>
        <Textarea
          id="recipe-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="recipe-prep">Prep (min)</Label>
          <Input id="recipe-prep" type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipe-cook">Cook (min)</Label>
          <Input id="recipe-cook" type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipe-servings">Servings</Label>
          <Input id="recipe-servings" type="number" value={servings} onChange={(e) => setServings(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipe-tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="recipe-tags"
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addTag}>
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs"
              >
                {tag}
                <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Ingredients</Label>
        {ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={ing}
              onChange={(e) => {
                const next = [...ingredients];
                next[i] = e.target.value;
                setIngredients(next);
              }}
            />
            {ingredients.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIngredients([...ingredients, ""])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add ingredient
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Steps</Label>
        {steps.map((step, i) => (
          <div key={i} className="flex gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-xs text-muted-foreground">
              {i + 1}
            </span>
            <Textarea
              value={step}
              onChange={(e) => {
                const next = [...steps];
                next[i] = e.target.value;
                setSteps(next);
              }}
              rows={2}
            />
            {steps.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSteps(steps.filter((_, j) => j !== i))}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setSteps([...steps, ""])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add step
        </Button>
      </div>

      <Button onClick={handleSave} className="w-full" disabled={saving}>
        {saving ? "Saving..." : "Save recipe"}
      </Button>
    </div>
  );
}
