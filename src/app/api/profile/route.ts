import type { Database } from "@/lib/supabase/database.types";
import {
  endpoint,
  json,
  body,
  authenticated,
  checked,
  text,
  boolean,
  ApiError,
} from "@/lib/api";
import { profileData } from "@/lib/profile";
export const GET = endpoint(async () => {
  const { supabase, user } = await authenticated();
  const profile = checked(
    await supabase.from("profiles").select("*").eq("id", user.id).single(),
  );
  const data = await profileData(supabase, user.id);
  const goal = checked(
    await supabase
      .from("reading_goals")
      .select("year,target_books")
      .eq("user_id", user.id)
      .eq("year", new Date().getFullYear())
      .maybeSingle(),
  );
  return json({ user: { ...profile, email: user.email }, ...data, goal });
});
export const PATCH = endpoint(async (req) => {
  const { supabase, user } = await authenticated();
  const input = await body(req);
  const changes: Database["public"]["Tables"]["profiles"]["Update"] = {};
  if ("name" in input) changes.name = text(input.name, "Name", 100);
  if ("bio" in input) changes.bio = text(input.bio, "Bio", 1000);
  if ("avatarUrl" in input) {
    const value = text(input.avatarUrl, "Avatar URL", 2048);
    if (value) {
      let u: URL;
      try {
        u = new URL(value);
      } catch {
        throw new ApiError("Invalid avatar URL");
      }
      if (u.protocol !== "https:")
        throw new ApiError("Avatar URL must use HTTPS");
    }
    changes.avatar_url = value;
  }
  if ("isPublic" in input) changes.is_public = boolean(input.isPublic);
  if (!Object.keys(changes).length) throw new ApiError("No fields to update");
  const profile = checked(
    await supabase
      .from("profiles")
      .update(changes)
      .eq("id", user.id)
      .select("*")
      .single(),
  );
  return json({ user: { ...profile, email: user.email } });
});
