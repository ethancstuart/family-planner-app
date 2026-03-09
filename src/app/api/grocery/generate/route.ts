import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCategoryForIngredient } from "@/lib/constants";

export async function POST(request: Request) {
  const supabase = await createClient();
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

  const body = await request.json();
  const { meal_plan_id } = body;

  if (!meal_plan_id) {
    return NextResponse.json(
      { error: "meal_plan_id is required" },
      { status: 400 }
    );
  }

  // Get meal plan slots with recipes
  const { data: slots, error: slotsError } = await supabase
    .from("meal_plan_slots")
    .select("*, recipe:recipes(*)")
    .eq("meal_plan_id", meal_plan_id);

  if (slotsError || !slots) {
    return NextResponse.json(
      { error: "Could not fetch meal plan" },
      { status: 400 }
    );
  }

  // Get pantry staples to exclude
  const { data: staples } = await supabase
    .from("pantry_staples")
    .select("name")
    .eq("household_id", membership.household_id);

  const stapleNames = new Set(
    (staples ?? []).map((s) => s.name.toLowerCase().trim())
  );

  // Merge ingredients from all recipes
  const merged = new Map<
    string,
    { name: string; quantity: number; unit: string | null; category: string }
  >();

  for (const slot of slots) {
    if (!slot.recipe?.ingredients) continue;

    for (const ing of slot.recipe.ingredients) {
      const key = ing.name.toLowerCase().trim();

      // Skip pantry staples
      if (stapleNames.has(key)) continue;

      if (merged.has(key)) {
        const existing = merged.get(key)!;
        // Sum quantities if same unit
        if (
          ing.quantity &&
          existing.unit === (ing.unit || null)
        ) {
          existing.quantity += ing.quantity;
        }
      } else {
        merged.set(key, {
          name: ing.name,
          quantity: ing.quantity ?? 1,
          unit: ing.unit || null,
          category: ing.category || getCategoryForIngredient(ing.name),
        });
      }
    }
  }

  // Get the week start date for the title
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("week_start_date")
    .eq("id", meal_plan_id)
    .single();

  const weekLabel = mealPlan?.week_start_date
    ? `Week of ${new Date(mealPlan.week_start_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : "Grocery List";

  // Create the grocery list
  const { data: groceryList, error: listError } = await supabase
    .from("grocery_lists")
    .insert({
      household_id: membership.household_id,
      title: weekLabel,
      meal_plan_id,
    })
    .select()
    .single();

  if (listError || !groceryList) {
    return NextResponse.json(
      { error: "Failed to create grocery list" },
      { status: 500 }
    );
  }

  // Insert items
  const items = Array.from(merged.values()).map((item) => ({
    grocery_list_id: groceryList.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    checked: false,
  }));

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from("grocery_items")
      .insert(items);

    if (itemsError) {
      return NextResponse.json(
        { error: "Failed to add items" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ grocery_list: groceryList });
}
