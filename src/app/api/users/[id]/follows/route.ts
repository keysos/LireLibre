import { endpoint, json, authenticated, integer } from "@/lib/api";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowCounts,
} from "@/lib/follows";
export const GET = endpoint(async (req, { id }) => {
  const { supabase } = await authenticated();
  const query = new URL(req.url).searchParams;
  const kind = query.get("kind");
  if (kind === "followers" || kind === "following") {
    const page = integer(query.get("page") ?? 0, "page", 0, 100000);
    return json(
      await (kind === "followers" ? getFollowers : getFollowing)(
        supabase,
        id,
        page,
      ),
    );
  }
  return json(await getFollowCounts(supabase, id));
});
export const POST = endpoint(async (_req, { id }) => {
  const { supabase } = await authenticated();
  await followUser(supabase, id);
  return json({ success: true });
});
export const DELETE = endpoint(async (_req, { id }) => {
  const { supabase } = await authenticated();
  await unfollowUser(supabase, id);
  return json({ success: true });
});
