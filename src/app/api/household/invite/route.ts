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

  // Check user is owner of a household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .limit(1)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Not a household owner" }, { status: 403 });
  }

  // Create invitation
  const { data: invitation, error } = await supabase
    .from("household_invitations")
    .insert({
      household_id: membership.household_id,
      created_by: user.id,
    })
    .select("token, expires_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(".supabase.co", ".vercel.app") || "http://localhost:3000";
  const invite_url = `${origin}/invite/${invitation.token}`;

  return NextResponse.json({
    token: invitation.token,
    invite_url,
    expires_at: invitation.expires_at,
  });
}

export async function GET(request: Request) {
  const supabase = await createApiClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .limit(1)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Not a household owner" }, { status: 403 });
  }

  const { data: invitations, error } = await supabase
    .from("household_invitations")
    .select("id, token, expires_at, created_at, used_by, used_at")
    .eq("household_id", membership.household_id)
    .is("used_by", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to list invitations" }, { status: 500 });
  }

  return NextResponse.json({ invitations });
}

export async function DELETE(request: Request) {
  const supabase = await createApiClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const invitationId = body.id;

  if (!invitationId) {
    return NextResponse.json({ error: "Invitation ID required" }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .limit(1)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Not a household owner" }, { status: 403 });
  }

  const { error } = await supabase
    .from("household_invitations")
    .delete()
    .eq("id", invitationId)
    .eq("household_id", membership.household_id);

  if (error) {
    return NextResponse.json({ error: "Failed to revoke invitation" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
