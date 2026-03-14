import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RecipeList } from "@/components/recipes/recipe-list";
import { AddRecipeButton } from "@/components/recipes/add-recipe-button";

export default async function RecipesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard/onboarding");

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("household_id", membership.household_id)
    .order("created_at", { ascending: false });

  return (
    <AppShell user={user}>
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
