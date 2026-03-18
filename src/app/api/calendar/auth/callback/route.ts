import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/from-token";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeCode } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/calendar?error=missing_params`);
  }

  const supabase = await createApiClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== state) {
    return NextResponse.redirect(`${origin}/calendar?error=auth_mismatch`);
  }

  try {
    const redirectUri = `${origin}/api/calendar/auth/callback`;
    const tokens = await exchangeCode(code, redirectUri);

    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString();

    const admin = createAdminClient();

    // Remove existing connection for this user
    await admin
      .from("calendar_connections")
      .delete()
      .eq("user_id", user.id);

    // Insert new connection
    await admin.from("calendar_connections").insert({
      user_id: user.id,
      provider: "google",
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token!,
      expires_at: expiresAt,
      calendar_id: "primary",
    });

    return NextResponse.redirect(`${origin}/calendar?connected=true`);
  } catch {
    return NextResponse.redirect(`${origin}/calendar?error=token_exchange`);
  }
}
