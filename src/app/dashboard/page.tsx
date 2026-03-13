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
} from "lucide-react";
import { getWeekStartDate } from "@/lib/utils";
import { DAYS_OF_WEEK_SHORT } from "@/lib/constants";

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

  // Fetch meal slots if we have a plan — get all 7 days
  let upcomingMeals: { day_of_week: number; meal_type: string; recipe: { title: string } | null }[] = [];
  if (mealPlanResult.data) {
    const { data: slots } = await supabase
      .from("meal_plan_slots")
      .select("day_of_week, meal_type, recipe:recipes(title)")
      .eq("meal_plan_id", mealPlanResult.data.id)
      .limit(28);
    if (slots) {
      upcomingMeals = slots.map((s: Record<string, unknown>) => ({
        day_of_week: s.day_of_week as number,
        meal_type: s.meal_type as string,
        recipe: Array.isArray(s.recipe) ? s.recipe[0] ?? null : s.recipe as { title: string } | null,
      }));
    }
  }

  // Fetch grocery item counts
  const groceryProgress = { total: 0, checked: 0 };
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

  // Group meals by day for 7-day strip
  const mealsByDay: Record<number, { meal_type: string; recipe: { title: string } | null }[]> = {};
  for (const slot of upcomingMeals) {
    if (!mealsByDay[slot.day_of_week]) mealsByDay[slot.day_of_week] = [];
    mealsByDay[slot.day_of_week].push(slot);
  }

  return (
    <AppShell user={user}>
      <div className="space-y-8">
        {/* Greeting hero */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hey, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening in your kitchen.
          </p>
        </div>

        {/* Setup checklist — only shows when incomplete */}
        {(!hasApiKey || recipeCount === 0) && (
          <section aria-label="Setup" className="rounded-xl border border-primary/20 border-l-4 border-l-primary bg-primary/5 p-6">
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
          </section>
        )}

        {/* Two-zone layout */}
        <section aria-label="Overview" className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Left zone */}
          <div className="space-y-6">
            {/* Quick actions — compact pill buttons */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/recipes"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary"
              >
                <UtensilsCrossed className="h-4 w-4 text-primary" />
                Recipes
                <span className="text-muted-foreground">({recipeCount})</span>
              </Link>
              <Link
                href="/recipes"
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary/40"
              >
                <Plus className="h-4 w-4" />
                Add Recipe
              </Link>
              <Link
                href="/meal-planner"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary"
              >
                <CalendarDays className="h-4 w-4 text-primary" />
                Meal Plan
              </Link>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </Link>
            </div>

            {/* Week meal strip */}
            <Link href="/meal-planner" className="group block">
              <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">This Week&apos;s Meals</h3>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK_SHORT.map((day, i) => {
                    const dayMeals = mealsByDay[i] ?? [];
                    return (
                      <div key={i} className="text-center">
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {day}
                        </p>
                        {dayMeals.length > 0 ? (
                          <div className="space-y-0.5">
                            {dayMeals.slice(0, 2).map((m, j) => (
                              <p key={j} className="truncate text-[10px] leading-tight">
                                {m.recipe?.title ?? m.meal_type}
                              </p>
                            ))}
                            {dayMeals.length > 2 && (
                              <p className="text-[10px] text-muted-foreground">+{dayMeals.length - 2}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/50">&mdash;</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Link>

            {/* Favorites — horizontal scroll */}
            {favorites.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Favorites</h2>
                  <Link
                    href="/recipes"
                    className="text-xs text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {favorites.map((recipe) => (
                    <Link
                      key={recipe.id}
                      href={`/recipes/${recipe.id}`}
                      className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 transition-colors hover:border-primary"
                    >
                      <ChefHat className="h-4 w-4 shrink-0 text-primary" />
                      <span className="whitespace-nowrap text-sm font-medium">
                        {recipe.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right zone */}
          <div className="space-y-4">
            {/* Grocery progress widget */}
            <Link
              href={groceryList ? `/grocery/${groceryList.id}` : "/grocery"}
              className="group relative block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
            >
              <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-primary" />
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
                <div className="mt-3 space-y-2">
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
                <p className="mt-2 text-xs text-muted-foreground">
                  {groceryList
                    ? "List is empty. Add some items."
                    : "No active list. Create one from your meal plan."}
                </p>
              )}
            </Link>

            {/* Pending tasks widget */}
            <Link
              href="/todos"
              className="group relative block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
            >
              <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-primary" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Pending Tasks</h3>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              {pendingTodos.length > 0 ? (
                <div className="mt-3 space-y-1.5">
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
                <p className="mt-2 text-xs text-muted-foreground">
                  All caught up! No pending tasks.
                </p>
              )}
            </Link>
          </div>
        </section>
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
            ? "bg-primary text-primary-foreground"
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
