import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/from-token";
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
  const supabase = await createApiClient(request);
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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
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
    const { accessToken } = await getCalendarClient(user.id);
    const weekStart = parseDate(week_start_date);

    // Build event requests for all valid slots
    const eventRequests = slots
      .filter((slot) => {
        const recipe = slot.recipe;
        const mealConfig = mealTimes[slot.meal_type as MealType];
        return recipe && mealConfig;
      })
      .map((slot) => {
        const recipe = slot.recipe!;
        const mealConfig = mealTimes[slot.meal_type as MealType];

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

        return fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              summary: `${mealConfig.label}: ${recipe.title}`,
              description,
              start: { dateTime: eventDate.toISOString() },
              end: { dateTime: endDate.toISOString() },
            }),
          }
        );
      });

    // Execute all calendar inserts in parallel
    const results = await Promise.all(eventRequests);

    for (const res of results) {
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to insert event: ${err}`);
      }
    }

    return NextResponse.json({ synced: results.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync meals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
