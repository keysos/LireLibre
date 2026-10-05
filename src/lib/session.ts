import { createClient } from "@/lib/supabase/server";
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : (data.user?.id ?? null);
}
