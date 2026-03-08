import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";
import {
  UtensilsCrossed,
  Plus,
  Settings,
  Sparkles,
  ArrowRight,
  ChefHat,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, role, households(id, name)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard/onboarding");

  const householdId = membership.household_id;

  // Get real counts
  const [recipesResult, settingsResult, favoritesResult] = await Promise.all([
    supabase
      .from("recipes")
      .select("id", { count: "exact", head: true })
      .eq("household_id", householdId),
    supabase
      .from("household_settings")
      .select("claude_api_key_encrypted")
      .eq("household_id", householdId)
      .single(),
    supabase
      .from("recipes")
      .select("id, title")
      .eq("household_id", householdId)
      .eq("is_favorite", true)
      .limit(5),
  ]);

  const recipeCount = recipesResult.count ?? 0;
  const hasApiKey = !!settingsResult.data?.claude_api_key_encrypted;
  const favorites = favoritesResult.data ?? [];
  const firstName = user.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <AppShell user={user}>
      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Hey, {firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening in your kitchen.
          </p>
        </div>

        {/* Setup checklist — only shows when incomplete */}
        {(!hasApiKey || recipeCount === 0) && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5 text-primary" />
              Get started
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete these steps to unlock the full experience.
            </p>
            <div className="mt-4 space-y-3">
              <SetupStep
                done={hasApiKey}
                href="/settings"
                title="Add your Claude API key"
                desc="Enables AI recipe import from URLs, videos, and photos"
              />
              <SetupStep
                done={recipeCount > 0}
                href="/recipes"
                title="Save your first recipe"
                desc="Paste a URL, drop a TikTok link, or type one in"
              />
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/recipes"
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Recipe Vault</p>
              <p className="text-sm text-muted-foreground">
                {recipeCount} recipe{recipeCount !== 1 ? "s" : ""} saved
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/recipes"
            className="group flex items-center gap-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary">Add a recipe</p>
              <p className="text-sm text-muted-foreground">
                URL, video, photo, or manual
              </p>
            </div>
          </Link>

          <Link
            href="/settings"
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Settings</p>
              <p className="text-sm text-muted-foreground">
                API keys & household
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Favorites</h2>
              <Link
                href="/recipes"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-all hover:border-primary/30"
                >
                  <ChefHat className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate text-sm font-medium">
                    {recipe.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SetupStep({
  done,
  href,
  title,
  desc,
}: {
  done: boolean;
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
        done
          ? "border-accent/30 bg-accent/5"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done
            ? "bg-accent text-accent-foreground"
            : "border-2 border-primary/30 text-primary"
        }`}
      >
        {done ? "\u2713" : ""}
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-medium ${done ? "line-through opacity-60" : ""}`}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </Link>
  );
}
