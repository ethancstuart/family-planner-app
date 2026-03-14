import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DiscoverRecipes } from "@/components/recipes/discover-recipes";
import { Settings, Compass } from "lucide-react";

export const metadata: Metadata = { title: "Discover Recipes" };
import Link from "next/link";

export default async function DiscoverPage() {
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

  const { data: settings } = await supabase
    .from("household_settings")
    .select("spoonacular_api_key")
    .eq("household_id", membership.household_id)
    .single();

  const hasApiKey = !!settings?.spoonacular_api_key;

  // Get saved spoonacular IDs to show "Already saved" badge
  const { data: savedRecipes } = await supabase
    .from("recipes")
    .select("spoonacular_id")
    .eq("household_id", membership.household_id)
    .not("spoonacular_id", "is", null);

  const savedSpoonacularIds = (savedRecipes ?? [])
    .map((r) => r.spoonacular_id as number)
    .filter(Boolean);

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Discover Recipes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Browse thousands of recipes and save your favorites.
          </p>
        </div>

        {!hasApiKey ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Compass className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Set up Spoonacular API Key</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              To discover recipes, add your Spoonacular API key in Settings. You
              can get a free key at spoonacular.com.
            </p>
            <Link
              href="/settings"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Settings className="h-4 w-4" />
              Go to Settings
            </Link>
          </div>
        ) : (
          <DiscoverRecipes savedSpoonacularIds={savedSpoonacularIds} />
        )}
      </div>
    </AppShell>
  );
}
