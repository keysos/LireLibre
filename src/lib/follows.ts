import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError, checked, integer, uuid } from "@/lib/api";
async function me(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new ApiError("Not authenticated", 401);
  return data.user.id;
}
export async function followUser(
  supabase: SupabaseClient<Database>,
  targetId: string,
) {
  const target = uuid(targetId),
    follower = await me(supabase);
  if (target === follower) throw new ApiError("You cannot follow yourself");
  checked(
    await supabase
      .from("follows")
      .upsert(
        { follower_id: follower, following_id: target },
        { onConflict: "follower_id,following_id", ignoreDuplicates: true },
      ),
  );
}
export async function unfollowUser(
  supabase: SupabaseClient<Database>,
  targetId: string,
) {
  checked(
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", await me(supabase))
      .eq("following_id", uuid(targetId)),
  );
}
export async function getFollowers(
  supabase: SupabaseClient<Database>,
  userId: string,
  page = 0,
  pageSize = 20,
) {
  await me(supabase);
  integer(page, "page", 0, 100000);
  integer(pageSize, "pageSize", 1, 100);
  const result = await supabase
    .from("follows")
    .select(
      "follower_id,created_at,profile:profiles!follows_follower_id_fkey(id,name,avatar_url)",
      { count: "exact" },
    )
    .eq("following_id", uuid(userId))
    .order("created_at", { ascending: false })
    .order("follower_id")
    .range(page * pageSize, (page + 1) * pageSize - 1);
  return { items: checked(result) ?? [], total: result.count ?? 0 };
}
export async function getFollowing(
  supabase: SupabaseClient<Database>,
  userId: string,
  page = 0,
  pageSize = 20,
) {
  await me(supabase);
  integer(page, "page", 0, 100000);
  integer(pageSize, "pageSize", 1, 100);
  const result = await supabase
    .from("follows")
    .select(
      "following_id,created_at,profile:profiles!follows_following_id_fkey(id,name,avatar_url)",
      { count: "exact" },
    )
    .eq("follower_id", uuid(userId))
    .order("created_at", { ascending: false })
    .order("following_id")
    .range(page * pageSize, (page + 1) * pageSize - 1);
  return { items: checked(result) ?? [], total: result.count ?? 0 };
}
export async function getFollowCounts(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const current = await me(supabase);
  const target = uuid(userId);
  const [followers, following, relation] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", target),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", target),
    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", current)
      .eq("following_id", target)
      .maybeSingle(),
  ]);
  checked(followers);
  checked(following);
  const linked = checked(relation);
  return {
    followers: followers.count ?? 0,
    following: following.count ?? 0,
    isFollowing: !!linked,
    isSelf: current === target,
  };
}
