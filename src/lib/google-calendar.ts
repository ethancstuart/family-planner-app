import { google, calendar_v3 } from "googleapis";
import { createAdminClient } from "@/lib/supabase/admin";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
}

export function getAuthUrl(redirectUri: string, state: string): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    redirect_uri: redirectUri,
    state,
  });
}

export async function exchangeCode(code: string, redirectUri: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken({ code, redirect_uri: redirectUri });
  return tokens;
}

export async function getCalendarClient(
  userId: string
): Promise<calendar_v3.Calendar> {
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

  const client = getOAuth2Client();
  client.setCredentials({
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
  });

  return google.calendar({ version: "v3", auth: client });
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

  const client = getOAuth2Client();
  client.setCredentials({ refresh_token: connection.refresh_token });

  const { credentials } = await client.refreshAccessToken();

  const newExpiresAt = credentials.expiry_date
    ? new Date(credentials.expiry_date).toISOString()
    : new Date(Date.now() + 3600 * 1000).toISOString();

  const supabase = createAdminClient();
  await supabase
    .from("calendar_connections")
    .update({
      access_token: credentials.access_token!,
      expires_at: newExpiresAt,
    })
    .eq("id", connection.id);

  return {
    ...connection,
    access_token: credentials.access_token!,
    expires_at: newExpiresAt,
  };
}
