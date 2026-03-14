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
      { error: "No Spoonacular API key configured. Add one in Settings." },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { query, cuisine, diet, offset = 0 } = body;

  if (!query?.trim()) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    query: query.trim(),
    addRecipeInformation: "true",
    fillIngredients: "true",
    number: "12",
    offset: String(offset),
    apiKey,
  });

  if (cuisine) params.set("cuisine", cuisine);
  if (diet) params.set("diet", diet);

  const res = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Spoonacular API error. Check your API key." },
      { status: res.status }
    );
  }

  const data = await res.json();

  return NextResponse.json({
    results: data.results ?? [],
    totalResults: data.totalResults ?? 0,
  });
}
