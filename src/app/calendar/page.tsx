import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { createFamilyClient, FAMILY_HOUSEHOLD_ID } from "@/lib/supabase/family";
import { CalendarHub } from "@/components/calendar/calendar-hub";
import { getWeekStartDate } from "@/lib/utils";
import type { MealPlanSlot } from "@/types";

export const metadata: Metadata = { title: "Calendar" };

interface PageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = createFamilyClient();
  const householdId = FAMILY_HOUSEHOLD_ID;

  const weekStart = params.week || getWeekStartDate();

  // Fetch current week's meal plan + slots
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", householdId)
    .eq("week_start_date", weekStart)
    .single();

  const { data: slots } = mealPlan
    ? await supabase
        .from("meal_plan_slots")
        .select("*, recipe:recipes(*)")
        .eq("meal_plan_id", mealPlan.id)
    : { data: [] };

  return (
    <AppShell>
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
          isConnected={false}
          weekStart={weekStart}
          mealPlanSlots={(slots as MealPlanSlot[]) ?? []}
          mealPlanId={mealPlan?.id}
        />
      </div>
    </AppShell>
  );
}
