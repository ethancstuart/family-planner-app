import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Ingredient } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { data: settings } = await supabase
    .from("household_settings")
    .select("spoonacular_api_key")
    .eq("household_id", membership.household_id)
    .single();

  const apiKey = settings?.spoonacular_api_key;
  if (!apiKey) {
    return NextResponse.json(
      { error: "No Spoonacular API key configured" },
      { status: 400 }
    );
  }

  const res = await fetch(
    `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${apiKey}`
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch recipe from Spoonacular" },
      { status: res.status }
    );
  }

  const data = await res.json();

  // Transform to app's recipe shape
  const ingredients: Ingredient[] = (data.extendedIngredients ?? []).map(
    (ing: { name: string; amount: number; unit: string }) => ({
      name: ing.name,
      quantity: ing.amount || null,
      unit: ing.unit || null,
    })
  );

  const steps: string[] =
    data.analyzedInstructions?.[0]?.steps?.map(
      (s: { step: string }) => s.step
    ) ?? [];

  const tags: string[] = [
    ...(data.cuisines ?? []),
    ...(data.diets ?? []),
    ...(data.dishTypes ?? []),
  ]
    .map((t: string) => t.toLowerCase())
    .slice(0, 8);

  const readyInMinutes = data.readyInMinutes ?? 0;
  const prepTime = Math.round(readyInMinutes * 0.3);
  const cookTime = readyInMinutes - prepTime;

  const recipe = {
    title: data.title ?? "",
    description: data.summary
      ? data.summary.replace(/<[^>]*>/g, "").slice(0, 300)
      : null,
    ingredients,
    steps,
    tags,
    prep_time_minutes: prepTime > 0 ? prepTime : null,
    cook_time_minutes: cookTime > 0 ? cookTime : null,
    servings: data.servings ?? null,
    source_url: data.sourceUrl ?? null,
    source_type: "spoonacular" as const,
    image_url: data.image ?? null,
    is_favorite: false,
    spoonacular_id: data.id,
  };

  return NextResponse.json({ recipe });
}
