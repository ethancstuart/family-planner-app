import { createClient } from "@supabase/supabase-js";

// Server-only admin client that bypasses RLS.
// Used for operations that need to read data for unauthenticated users
// (e.g., looking up invite details on the invite acceptance page).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
