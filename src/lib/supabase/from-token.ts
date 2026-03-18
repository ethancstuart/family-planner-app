import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createCookieClient } from "./server";

/**
 * Create a Supabase client authenticated via Bearer token.
 * Used by native mobile clients that send JWT in Authorization header.
 */
export function createClientFromToken(token: string) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  );
}

/**
 * Create a Supabase client for API routes, supporting both:
 * - Bearer token auth (native mobile clients)
 * - Cookie-based auth (web browser clients)
 *
 * Checks Authorization header first, falls back to cookie auth.
 */
export async function createApiClient(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return createClientFromToken(authHeader.slice(7));
  }
  return createCookieClient();
}
