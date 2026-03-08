"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, X } from "lucide-react";

interface ManualRecipeFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function ManualRecipeForm({ onSuccess, onBack }: ManualRecipeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
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

    const parsedIngredients = ingredients
      .filter((i) => i.trim())
      .map((i) => ({ name: i.trim(), quantity: null, unit: null }));

    const parsedSteps = steps.filter((s) => s.trim());

    const { error } = await supabase.from("recipes").insert({
      household_id: membership.household_id,
      title: title.trim(),
      description: description.trim() || null,
      ingredients: parsedIngredients,
      steps: parsedSteps,
      tags,
      prep_time_minutes: prepTime ? parseInt(prepTime) : null,
      cook_time_minutes: cookTime ? parseInt(cookTime) : null,
      servings: servings ? parseInt(servings) : null,
      source_type: "manual",
      created_by: user.id,
    });

    setLoading(false);
    if (!error) {
      router.refresh();
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="e.g. Chicken Parm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Quick notes about this recipe..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="prep">Prep (min)</Label>
          <Input
            id="prep"
            type="number"
            placeholder="15"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cook">Cook (min)</Label>
          <Input
            id="cook"
            type="number"
            placeholder="30"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="servings">Servings</Label>
          <Input
            id="servings"
            type="number"
            placeholder="4"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. dinner, quick, kids"
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
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <Label>Ingredients</Label>
        {ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder={`Ingredient ${i + 1}`}
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
                onClick={() =>
                  setIngredients(ingredients.filter((_, j) => j !== i))
                }
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

      {/* Steps */}
      <div className="space-y-2">
        <Label>Steps</Label>
        {steps.map((step, i) => (
          <div key={i} className="flex gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-xs text-muted-foreground">
              {i + 1}
            </span>
            <Textarea
              placeholder={`Step ${i + 1}`}
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Save recipe"}
      </Button>
    </form>
  );
}
