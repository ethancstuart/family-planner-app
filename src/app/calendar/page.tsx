import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CalendarHub } from "@/components/calendar/calendar-hub";
import { getWeekStartDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Calendar" };
import type { MealPlanSlot } from "@/types";

interface PageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Run independent queries in parallel
  const [membershipResult, connectionResult] = await Promise.all([
    supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .limit(1)
      .single(),
    supabase
      .from("calendar_connections")
      .select("id")
      .eq("user_id", user.id)
      .single(),
  ]);

  const membership = membershipResult.data;
  if (!membership) redirect("/dashboard/onboarding");

  const isConnected = !!connectionResult.data;

  const weekStart = params.week || getWeekStartDate();

  // Fetch current week's meal plan + slots
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", membership.household_id)
    .eq("week_start_date", weekStart)
    .single();

  const { data: slots } = mealPlan
    ? await supabase
        .from("meal_plan_slots")
        .select("*, recipe:recipes(*)")
        .eq("meal_plan_id", mealPlan.id)
    : { data: [] };

  return (
    <AppShell user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Calendar
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your schedule and meal plans in one place.
          </p>
        </div>

        <CalendarHub
          isConnected={isConnected}
          weekStart={weekStart}
          mealPlanSlots={(slots as MealPlanSlot[]) ?? []}
          mealPlanId={mealPlan?.id}
        />
      </div>
    </AppShell>
  );
}
