import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/from-token";

export async function POST(request: Request) {
  const supabase = await createApiClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const token = body.token;

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  // Look up invitation
  const { data: invitation, error: invError } = await supabase
    .from("household_invitations")
    .select("id, household_id, expires_at, used_by")
    .eq("token", token)
    .single();

  if (invError || !invitation) {
    return NextResponse.json({ error: "Invalid invitation" }, { status: 404 });
  }

  if (invitation.used_by) {
    return NextResponse.json({ error: "Invitation already used" }, { status: 410 });
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invitation expired" }, { status: 410 });
  }

  // Check user doesn't already have a household
  const { data: existing } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json({ error: "You already belong to a household" }, { status: 400 });
  }

  // Add user to household
  const { error: memberError } = await supabase
    .from("household_members")
    .insert({
      household_id: invitation.household_id,
      user_id: user.id,
      role: "member",
    });

  if (memberError) {
    return NextResponse.json({ error: "Failed to join household" }, { status: 500 });
  }

  // Mark invitation as used (atomically with used_by IS NULL check)
  const { error: updateError } = await supabase
    .from("household_invitations")
    .update({ used_by: user.id, used_at: new Date().toISOString() })
    .eq("id", invitation.id)
    .is("used_by", null);

  if (updateError) {
    // Non-critical: invitation was accepted but marking it as used failed
  }

  return NextResponse.json({ success: true, household_id: invitation.household_id });
}
