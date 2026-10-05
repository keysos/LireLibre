import { endpoint, json, checked } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
export const GET = endpoint(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return json({ user: null });
  const profile = checked(
    await supabase
      .from("profiles")
      .select("id,name,avatar_url")
      .eq("id", data.user.id)
      .single(),
  );
  return json({ user: { ...profile, email: data.user.email } });
});
