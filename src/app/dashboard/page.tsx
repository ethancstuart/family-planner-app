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
  CalendarDays,
  ShoppingCart,
  ListTodo,
  Clock,
} from "lucide-react";
import { getWeekStartDate } from "@/lib/utils";
import { MEAL_TYPE_LABELS, DAYS_OF_WEEK_SHORT } from "@/lib/constants";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: membership, error: membershipError } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (membershipError) {
    console.error("Membership query error:", membershipError);
  }

  if (!membership) redirect("/dashboard/onboarding");

  const householdId = membership.household_id;

  const weekStart = getWeekStartDate();

  // Get real counts
  const [
    recipesResult,
    settingsResult,
    favoritesResult,
    mealPlanResult,
    groceryResult,
    todosResult,
  ] = await Promise.all([
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
    // This week's meal plan slots
    supabase
      .from("meal_plans")
      .select("id")
      .eq("household_id", householdId)
      .eq("week_start_date", weekStart)
      .single(),
    // Most recent grocery list
    supabase
      .from("grocery_lists")
      .select("id, title")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    // Pending todos for current user
    supabase
      .from("todo_items")
      .select("id, title, due_date, todo_list_id")
      .eq("completed", false)
      .order("created_at")
      .limit(5),
  ]);

  const recipeCount = recipesResult.count ?? 0;
  const hasApiKey = !!settingsResult.data?.claude_api_key_encrypted;
  const favorites = favoritesResult.data ?? [];
  const firstName = user.user_metadata?.full_name?.split(" ")[0] || "there";

  // Fetch meal slots if we have a plan
  let upcomingMeals: { day_of_week: number; meal_type: string; recipe: { title: string } | null }[] = [];
  if (mealPlanResult.data) {
    const { data: slots } = await supabase
      .from("meal_plan_slots")
      .select("day_of_week, meal_type, recipe:recipes(title)")
      .eq("meal_plan_id", mealPlanResult.data.id)
      .limit(3);
    if (slots) {
      upcomingMeals = slots.map((s: Record<string, unknown>) => ({
        day_of_week: s.day_of_week as number,
        meal_type: s.meal_type as string,
        recipe: Array.isArray(s.recipe) ? s.recipe[0] ?? null : s.recipe as { title: string } | null,
      }));
    }
  }

  // Fetch grocery item counts
  let groceryProgress = { total: 0, checked: 0 };
  const groceryList = groceryResult.data;
  if (groceryList) {
    const { data: gItems } = await supabase
      .from("grocery_items")
      .select("checked")
      .eq("grocery_list_id", groceryList.id);
    if (gItems) {
      groceryProgress.total = gItems.length;
      groceryProgress.checked = gItems.filter((i) => i.checked).length;
    }
  }

  const pendingTodos = todosResult.data ?? [];

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

        {/* Hub widgets */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* This Week's Meals */}
          <Link
            href="/meal-planner"
            className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">This Week&apos;s Meals</h3>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            {upcomingMeals.length > 0 ? (
              <div className="space-y-2">
                {upcomingMeals.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-8 text-[10px] font-medium uppercase text-muted-foreground">
                      {DAYS_OF_WEEK_SHORT[slot.day_of_week]}
                    </span>
                    <span className="truncate text-xs">
                      {slot.recipe?.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No meals planned yet. Tap to start planning.
              </p>
            )}
          </Link>

          {/* Active Grocery List */}
          <Link
            href={groceryList ? `/grocery/${groceryList.id}` : "/grocery"}
            className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">
                  {groceryList?.title ?? "Grocery List"}
                </h3>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            {groceryList && groceryProgress.total > 0 ? (
              <div className="space-y-2">
                <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.round((groceryProgress.checked / groceryProgress.total) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {groceryProgress.checked}/{groceryProgress.total} items checked
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {groceryList
                  ? "List is empty. Add some items."
                  : "No active list. Create one from your meal plan."}
              </p>
            )}
          </Link>

          {/* Pending Tasks */}
          <Link
            href="/todos"
            className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Pending Tasks</h3>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            {pendingTodos.length > 0 ? (
              <div className="space-y-1.5">
                {pendingTodos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                    <span className="truncate text-xs">{todo.title}</span>
                    {todo.due_date && (
                      <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                        {new Date(todo.due_date + "T00:00:00").toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                All caught up! No pending tasks.
              </p>
            )}
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
