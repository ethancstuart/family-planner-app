import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getWeekStartDate, parseDate } from "@/lib/utils";

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

  let { data: mealPlan, error: mpError } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", membership.household_id)
    .eq("week_start_date", weekStart)
    .single();

  if (!mealPlan) {
    const { data: newPlan, error: insertError } = await supabase
      .from("meal_plans")
      .insert({
        household_id: membership.household_id,
        week_start_date: weekStart,
      })
      .select()
      .single();
    mealPlan = newPlan;
  }

  const [slotsResult, calResult, recipesResult] = await Promise.all([
    mealPlan
      ? supabase
          .from("meal_plan_slots")
          .select("*, recipe:recipes(*)")
          .eq("meal_plan_id", mealPlan.id)
      : Promise.resolve({ data: [] as null[], error: null }),
    supabase
      .from("calendar_connections")
      .select("id")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("recipes")
      .select("*")
      .eq("household_id", membership.household_id)
      .order("title"),
  ]);

  const weekDate = parseDate(weekStart);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Meal Planner - Diagnostic Step 3</h1>
      <p>Data fetching test.</p>
      <pre className="mt-4 rounded bg-gray-100 p-4 text-xs">
        {JSON.stringify({
          user: user?.email,
          household: membership.household_id,
          weekStart,
          mealPlan: mealPlan?.id ?? "none",
          mpError: mpError?.message,
          slots: slotsResult.data?.length ?? 0,
          slotsError: slotsResult.error?.message,
          calConnection: !!calResult.data,
          calError: calResult.error?.message,
          recipes: recipesResult.data?.length ?? 0,
          recipesError: recipesResult.error?.message,
          weekDate: weekDate.toISOString(),
        }, null, 2)}
      </pre>
    </div>
  );
}
