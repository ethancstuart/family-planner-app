import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { WeekView } from "@/components/meal-planner/week-view";
import { MealPlannerHeader } from "@/components/meal-planner/meal-planner-header";
import { EmptyMealPlan } from "@/components/meal-planner/empty-meal-plan";
import { getWeekStartDate, parseDate } from "@/lib/utils";
import type { Recipe, MealPlanSlot } from "@/types";

interface PageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function MealPlannerPage({ searchParams }: PageProps) {
  const params = await searchParams;
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

  const weekStart = params.week || getWeekStartDate();

  // Get or create meal plan for this week
  let { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", membership.household_id)
    .eq("week_start_date", weekStart)
    .single();

  if (!mealPlan) {
    const { data: newPlan } = await supabase
      .from("meal_plans")
      .insert({
        household_id: membership.household_id,
        week_start_date: weekStart,
      })
      .select()
      .single();
    mealPlan = newPlan;
  }

  // Fetch slots with recipes
  const { data: slots } = mealPlan
    ? await supabase
        .from("meal_plan_slots")
        .select("*, recipe:recipes(*)")
        .eq("meal_plan_id", mealPlan.id)
    : { data: [] };

  // Fetch all recipes for the picker
  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("household_id", membership.household_id)
    .order("title");

  const weekDate = parseDate(weekStart);
  const hasAnySlots = (slots ?? []).length > 0;

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Meal Planner
            </h1>
            <p className="mt-1 text-muted-foreground">
              Plan your week, one meal at a time.
            </p>
          </div>
        </div>

        <MealPlannerHeader
          weekStart={weekStart}
          currentDate={weekDate}
          mealPlanId={mealPlan?.id ?? ""}
          hasSlots={hasAnySlots}
        />

        {!hasAnySlots && (recipes ?? []).length === 0 ? (
          <EmptyMealPlan />
        ) : (
          <WeekView
            weekStart={weekStart}
            mealPlanId={mealPlan?.id ?? ""}
            slots={(slots as MealPlanSlot[]) ?? []}
            recipes={(recipes as Recipe[]) ?? []}
          />
        )}
      </div>
    </AppShell>
  );
}
