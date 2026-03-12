import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCalendarClient } from "@/lib/google-calendar";
import { parseDate } from "@/lib/utils";
import type { MealType } from "@/types";

const mealTimes: Record<MealType, { hour: number; label: string }> = {
  breakfast: { hour: 8, label: "Breakfast" },
  lunch: { hour: 12, label: "Lunch" },
  dinner: { hour: 18, label: "Dinner" },
  snack: { hour: 15, label: "Snack" },
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify household membership
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No household" }, { status: 403 });
  }

  const body = await request.json();
  const { meal_plan_id, week_start_date } = body;

  if (!meal_plan_id || !week_start_date) {
    return NextResponse.json(
      { error: "meal_plan_id and week_start_date required" },
      { status: 400 }
    );
  }

  // Fetch meal plan slots with recipes
  const { data: slots, error: slotsError } = await supabase
    .from("meal_plan_slots")
    .select("*, recipe:recipes(*)")
    .eq("meal_plan_id", meal_plan_id);

  if (slotsError) {
    return NextResponse.json(
      { error: "Failed to fetch meal plan" },
      { status: 500 }
    );
  }

  if (!slots || slots.length === 0) {
    return NextResponse.json({ synced: 0 });
  }

  try {
    const calendar = await getCalendarClient(user.id);
    const weekStart = parseDate(week_start_date);
    let synced = 0;

    for (const slot of slots) {
      const recipe = slot.recipe;
      if (!recipe) continue;

      const mealConfig = mealTimes[slot.meal_type as MealType];
      if (!mealConfig) continue;

      const eventDate = new Date(weekStart);
      eventDate.setDate(eventDate.getDate() + slot.day_of_week);
      eventDate.setHours(mealConfig.hour, 0, 0, 0);

      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 1);

      const ingredients = (recipe.ingredients ?? [])
        .slice(0, 3)
        .map(
          (i: { name: string; quantity?: number | null; unit?: string | null }) =>
            `${i.quantity ?? ""} ${i.unit ?? ""} ${i.name}`.trim()
        )
        .join(", ");

      const description = ingredients
        ? `Ingredients: ${ingredients}...`
        : undefined;

      await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: `${mealConfig.label}: ${recipe.title}`,
          description,
          start: { dateTime: eventDate.toISOString() },
          end: { dateTime: endDate.toISOString() },
        },
      });

      synced++;
    }

    return NextResponse.json({ synced });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync meals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
