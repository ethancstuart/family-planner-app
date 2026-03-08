import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Check if user already has a household
  const { data: existing } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already in a household" }, { status: 400 });
  }

  // Create household
  const { data: household, error: hError } = await supabase
    .from("households")
    .insert({ name })
    .select()
    .single();

  if (hError) {
    console.error("Household create error:", hError);
    return NextResponse.json({ error: hError.message }, { status: 500 });
  }

  // Add user as owner
  const { error: mError } = await supabase
    .from("household_members")
    .insert({
      household_id: household.id,
      user_id: user.id,
      role: "owner",
    });

  if (mError) {
    console.error("Membership create error:", mError);
    // Clean up the orphaned household
    await supabase.from("households").delete().eq("id", household.id);
    return NextResponse.json({ error: mError.message }, { status: 500 });
  }

  // Create default settings
  await supabase
    .from("household_settings")
    .insert({ household_id: household.id });

  return NextResponse.json({ household });
}
