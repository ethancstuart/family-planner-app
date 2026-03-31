import { createAdminClient } from "./admin";

/**
 * The single household ID for the Stuart family.
 * Set this to your household's UUID from Supabase after initial setup.
 * If not set, uses a fallback for local dev.
 */
export const FAMILY_HOUSEHOLD_ID =
  process.env.FAMILY_HOUSEHOLD_ID || "00000000-0000-0000-0000-000000000001";

/**
 * A fixed user ID for the family (used as created_by for recipes, etc.)
 */
export const FAMILY_USER_ID =
  process.env.FAMILY_USER_ID || "00000000-0000-0000-0000-000000000001";

/**
 * Create a Supabase client that bypasses RLS for family use.
 * All queries use the admin/service role client.
 */
export function createFamilyClient() {
  return createAdminClient();
}
