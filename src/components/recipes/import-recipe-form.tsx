"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { RecipeReviewForm } from "./recipe-review-form";
import type { Recipe } from "@/types";

interface ImportRecipeFormProps {
  mode: "url" | "video" | "image";
  onSuccess: () => void;
  onBack: () => void;
}

type ExtractedRecipe = Omit<Recipe, "id" | "household_id" | "created_by" | "created_at" | "updated_at">;

export function ImportRecipeForm({ mode, onSuccess, onBack }: ImportRecipeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [extracted, setExtracted] = useState<ExtractedRecipe | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExtract = async () => {
    if (mode !== "image" && !url.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recipes/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), mode }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to extract recipe");
      }

      const data = await res.json();
      setExtracted(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);

      const res = await fetch("/api/recipes/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mode: "image" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to extract recipe");
      }

      const data = await res.json();
      setExtracted(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (recipe: ExtractedRecipe) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!membership) return;

    const { error: insertError } = await supabase.from("recipes").insert({
      household_id: membership.household_id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tags: recipe.tags,
      prep_time_minutes: recipe.prep_time_minutes,
      cook_time_minutes: recipe.cook_time_minutes,
      servings: recipe.servings,
      source_url: recipe.source_url,
      source_type: recipe.source_type,
      created_by: user.id,
    });

    if (insertError) {
      toast.error("Failed to save recipe");
    } else {
      toast.success("Recipe saved!");
      router.refresh();
      onSuccess();
    }
  };

  if (extracted) {
    return (
      <RecipeReviewForm
        recipe={extracted}
        onSave={handleSave}
        onBack={() => setExtracted(null)}
      />
    );
  }

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

      {mode === "image" ? (
        <div className="space-y-3">
          <Label>Upload a photo or screenshot</Label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/30"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Click to upload</p>
              <p className="text-xs text-muted-foreground">
                Recipe cards, screenshots, handwritten recipes
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <Label htmlFor="import-url">
            {mode === "url" ? "Recipe URL" : "Video link"}
          </Label>
          <Input
            id="import-url"
            placeholder={
              mode === "url"
                ? "https://www.allrecipes.com/recipe/..."
                : "https://www.tiktok.com/@user/video/..."
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleExtract();
              }
            }}
          />
          <Button
            onClick={handleExtract}
            disabled={loading || !url.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting recipe...
              </>
            ) : (
              "Extract recipe"
            )}
          </Button>
        </div>
      )}

      {loading && mode === "image" && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Reading recipe from image...
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
