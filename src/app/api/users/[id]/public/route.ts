import { endpoint, json, checked, uuid, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { profileData } from "@/lib/profile";
export const GET = endpoint(async (_req, { id }) => {
  const supabase = await createClient();
  const userId = uuid(id);
  const user = checked(
    await supabase
      .from("profiles")
      .select("id,name,bio,avatar_url,created_at")
      .eq("id", userId)
      .eq("is_public", true)
      .maybeSingle(),
  );
  if (!user) throw new ApiError("Not found", 404);
  const data = await profileData(supabase, userId, true);
  return json({
    user,
    statusCounts: data.statusCounts,
    lists: data.lists,
    reviews: data.reviews,
  });
});
