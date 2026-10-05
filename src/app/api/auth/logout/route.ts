import { endpoint, json, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
export const POST = endpoint(async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw new ApiError("Unable to log out", 500);
  const response = json({ success: true });
  response.cookies.delete("session");
  response.cookies.delete("recovery_verified");
  return response;
});
