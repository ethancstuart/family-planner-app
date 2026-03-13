import { createAdminClient } from "@/lib/supabase/admin";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export function getAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCode(code: string, redirectUri: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const tokens: TokenResponse = await res.json();

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expiry_date: Date.now() + tokens.expires_in * 1000,
  };
}

export async function getCalendarClient(
  userId: string
): Promise<{ accessToken: string }> {
  const supabase = createAdminClient();

  const { data: connection, error } = await supabase
    .from("calendar_connections")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !connection) {
    throw new Error("No calendar connection found");
  }

  const refreshed = await refreshTokenIfNeeded(connection);

  return { accessToken: refreshed.access_token };
}

async function refreshTokenIfNeeded(connection: {
  id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}) {
  const expiresAt = new Date(connection.expires_at);
  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000;

  if (expiresAt.getTime() - now.getTime() > fiveMinutes) {
    return connection;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refresh_token: connection.refresh_token,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const tokens: TokenResponse = await res.json();

  const newExpiresAt = new Date(
    Date.now() + tokens.expires_in * 1000
  ).toISOString();

  const supabase = createAdminClient();
  await supabase
    .from("calendar_connections")
    .update({
      access_token: tokens.access_token,
      expires_at: newExpiresAt,
    })
    .eq("id", connection.id);

  return {
    ...connection,
    access_token: tokens.access_token,
    expires_at: newExpiresAt,
  };
}
