import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { templateId, targetMealPlanId } = body;

    if (!templateId || !targetMealPlanId) {
      return NextResponse.json(
        { error: "templateId and targetMealPlanId are required" },
        { status: 400 }
      );
    }

    // Fetch template slots
    const { data: templateSlots } = await supabase
      .from("meal_plan_template_slots")
      .select("recipe_id, day_of_week, meal_type")
      .eq("template_id", templateId);

    if (!templateSlots || templateSlots.length === 0) {
      return NextResponse.json(
        { error: "Template has no meals" },
        { status: 400 }
      );
    }

    // Delete existing target slots
    await supabase
      .from("meal_plan_slots")
      .delete()
      .eq("meal_plan_id", targetMealPlanId);

    // Bulk insert template slots mapped to target
    const newSlots = templateSlots.map((slot) => ({
      meal_plan_id: targetMealPlanId,
      recipe_id: slot.recipe_id,
      day_of_week: slot.day_of_week,
      meal_type: slot.meal_type,
    }));

    const { error } = await supabase.from("meal_plan_slots").insert(newSlots);

    if (error) {
      return NextResponse.json(
        { error: "Failed to apply template" },
        { status: 500 }
      );
    }

    return NextResponse.json({ applied: newSlots.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to apply template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
