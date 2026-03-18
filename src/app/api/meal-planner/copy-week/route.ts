import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/from-token";

export async function POST(request: Request) {
  const supabase = await createApiClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No household found" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { targetMealPlanId, sourceWeekStart } = body;

    if (!targetMealPlanId || !sourceWeekStart) {
      return NextResponse.json(
        { error: "targetMealPlanId and sourceWeekStart are required" },
        { status: 400 }
      );
    }

    // Find source meal plan
    const { data: sourcePlan } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("household_id", membership.household_id)
      .eq("week_start_date", sourceWeekStart)
      .single();

    if (!sourcePlan) {
      return NextResponse.json({ copied: 0 });
    }

    // Fetch source slots
    const { data: sourceSlots } = await supabase
      .from("meal_plan_slots")
      .select("recipe_id, day_of_week, meal_type")
      .eq("meal_plan_id", sourcePlan.id);

    if (!sourceSlots || sourceSlots.length === 0) {
      return NextResponse.json({ copied: 0 });
    }

    // Delete existing target slots
    await supabase
      .from("meal_plan_slots")
      .delete()
      .eq("meal_plan_id", targetMealPlanId);

    // Bulk insert source slots mapped to target
    const newSlots = sourceSlots.map((slot) => ({
      meal_plan_id: targetMealPlanId,
      recipe_id: slot.recipe_id,
      day_of_week: slot.day_of_week,
      meal_type: slot.meal_type,
    }));

    const { error } = await supabase.from("meal_plan_slots").insert(newSlots);

    if (error) {
      return NextResponse.json(
        { error: "Failed to copy meals" },
        { status: 500 }
      );
    }

    return NextResponse.json({ copied: newSlots.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to copy meals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
