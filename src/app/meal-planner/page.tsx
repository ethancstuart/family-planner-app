import { AppShell } from "@/components/layout/app-shell";
import { createFamilyClient, FAMILY_HOUSEHOLD_ID } from "@/lib/supabase/family";
import { WeekView } from "@/components/meal-planner/week-view";
import { MealPlannerHeader } from "@/components/meal-planner/meal-planner-header";
import { EmptyMealPlan } from "@/components/meal-planner/empty-meal-plan";
import { getWeekStartDate, parseDate } from "@/lib/utils";
import type { Metadata } from "next";
import type { Recipe, MealPlanSlot } from "@/types";

export const metadata: Metadata = { title: "Meal Planner" };

interface PageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function MealPlannerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = createFamilyClient();
  const householdId = FAMILY_HOUSEHOLD_ID;

  const weekStart = params.week || getWeekStartDate();

  let { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", householdId)
    .eq("week_start_date", weekStart)
    .single();

  if (!mealPlan) {
    const { data: newPlan } = await supabase
      .from("meal_plans")
      .insert({
        household_id: householdId,
        week_start_date: weekStart,
      })
      .select()
      .single();
    mealPlan = newPlan;
  }

  const [slotsResult, recipesResult] = await Promise.all([
    mealPlan
      ? supabase
          .from("meal_plan_slots")
          .select("*, recipe:recipes(*)")
          .eq("meal_plan_id", mealPlan.id)
      : Promise.resolve({ data: [] as null[], error: null }),
    supabase
      .from("recipes")
      .select("*")
      .eq("household_id", householdId)
      .order("title"),
  ]);

  const slots = slotsResult.data;
  const recipes = recipesResult.data;
  const weekDate = parseDate(weekStart);
  const hasAnySlots = (slots ?? []).length > 0;

  return (
    <AppShell>
      <div className="space-y-8">
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
          hasCalendarConnection={false}
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
