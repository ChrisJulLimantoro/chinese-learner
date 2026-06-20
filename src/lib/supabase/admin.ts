import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. Never expose to client code.
// Used only for seeding and shared-cache writes (lesson cards, accepted_answers).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
