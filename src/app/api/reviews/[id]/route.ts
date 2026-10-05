import {
  endpoint,
  json,
  body,
  authenticated,
  checked,
  integer,
  text,
  ApiError,
} from "@/lib/api";
export const PATCH = endpoint(async (req, { id }) => {
  const { supabase, user } = await authenticated();
  const input = await body(req);
  const row = checked(
    await supabase
      .from("reviews")
      .update({ body: text(input.body, "Review", 10000, true) })
      .eq("id", integer(id))
      .eq("user_id", user.id)
      .select("*")
      .maybeSingle(),
  );
  if (!row) throw new ApiError("Not found", 404);
  return json({ review: row });
});
export const DELETE = endpoint(async (_req, { id }) => {
  const { supabase, user } = await authenticated();
  const row = checked(
    await supabase
      .from("reviews")
      .delete()
      .eq("id", integer(id))
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle(),
  );
  if (!row) throw new ApiError("Not found", 404);
  return json({ success: true });
});
