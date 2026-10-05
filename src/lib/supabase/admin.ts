import type { Database } from "@/lib/supabase/database.types";
import "server-only";
import { createClient } from "@supabase/supabase-js";
// Use only for trusted catalog imports and administrative operations.
export function createAdminClient() {
  if (!process.env.SUPABASE_SECRET_KEY)
    throw new Error("SUPABASE_SECRET_KEY is missing");
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
