import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/from-token";

export async function GET(request: Request) {
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

  const { data: templates } = await supabase
    .from("meal_plan_templates")
    .select("*, meal_plan_template_slots(id)")
    .eq("household_id", membership.household_id)
    .order("created_at", { ascending: false });

  const result = (templates ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    created_at: t.created_at,
    slot_count: (t.meal_plan_template_slots as { id: string }[])?.length ?? 0,
  }));

  return NextResponse.json({ templates: result });
}

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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { name, sourceMealPlanId } = body;

  if (!name?.trim() || !sourceMealPlanId) {
    return NextResponse.json(
      { error: "name and sourceMealPlanId are required" },
      { status: 400 }
    );
  }

  // Fetch source slots
  const { data: sourceSlots } = await supabase
    .from("meal_plan_slots")
    .select("recipe_id, day_of_week, meal_type")
    .eq("meal_plan_id", sourceMealPlanId);

  if (!sourceSlots || sourceSlots.length === 0) {
    return NextResponse.json(
      { error: "No meals to save as template" },
      { status: 400 }
    );
  }

  // Create template
  const { data: template, error: templateError } = await supabase
    .from("meal_plan_templates")
    .insert({
      household_id: membership.household_id,
      name: name.trim(),
      created_by: user.id,
    })
    .select()
    .single();

  if (templateError || !template) {
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }

  // Copy slots as template slots
  const templateSlots = sourceSlots.map((slot) => ({
    template_id: template.id,
    recipe_id: slot.recipe_id,
    day_of_week: slot.day_of_week,
    meal_type: slot.meal_type,
  }));

  const { error: slotsError } = await supabase
    .from("meal_plan_template_slots")
    .insert(templateSlots);

  if (slotsError) {
    return NextResponse.json(
      { error: "Failed to save template slots" },
      { status: 500 }
    );
  }

  return NextResponse.json({ template });
}

export async function DELETE(request: Request) {
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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { templateId } = body;

  if (!templateId) {
    return NextResponse.json(
      { error: "templateId is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("meal_plan_templates")
    .delete()
    .eq("id", templateId)
    .eq("household_id", membership.household_id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
