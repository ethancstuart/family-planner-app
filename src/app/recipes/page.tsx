import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { createFamilyClient, FAMILY_HOUSEHOLD_ID } from "@/lib/supabase/family";
import { RecipeList } from "@/components/recipes/recipe-list";
import { AddRecipeButton } from "@/components/recipes/add-recipe-button";

export const metadata: Metadata = { title: "Recipes" };

export default async function RecipesPage() {
  const supabase = createFamilyClient();

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("household_id", FAMILY_HOUSEHOLD_ID)
    .order("created_at", { ascending: false });

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Recipes</h1>
            <p className="text-muted-foreground">
              {recipes?.length ?? 0} recipe{recipes?.length !== 1 ? "s" : ""} in
              your vault
            </p>
          </div>
          <AddRecipeButton />
        </div>

        <RecipeList recipes={recipes ?? []} />
      </div>
    </AppShell>
  );
}
