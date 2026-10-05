import type { Database } from "@/lib/supabase/database.types";
import {
  allRows,
  endpoint,
  json,
  body,
  authenticated,
  checked,
  integer,
  text,
  boolean,
  ApiError,
} from "@/lib/api";
export const GET = endpoint(async (_req, { id }) => {
  const { supabase, user } = await authenticated();
  const list = checked(
    await supabase
      .from("lists")
      .select("*")
      .eq("id", integer(id))
      .eq("user_id", user.id)
      .maybeSingle(),
  );
  if (!list) throw new ApiError("Not found", 404);
  const rows = await allRows((from, to) =>
    supabase
      .from("list_books")
      .select("added_at,book:books(id,title,author,cover_url)")
      .eq("list_id", list.id)
      .order("added_at", { ascending: false })
      .order("id")
      .range(from, to),
  );
  return json({
    list,
    books: (rows ?? []).map(({ book, added_at }) => ({ ...book, added_at })),
  });
});
export const PATCH = endpoint(async (req, { id }) => {
  const { supabase, user } = await authenticated();
  const input = await body(req);
  const changes: Database["public"]["Tables"]["lists"]["Update"] = {};
  if ("name" in input) changes.name = text(input.name, "List name", 100, true);
  if ("description" in input)
    changes.description = text(input.description, "Description", 2000);
  if ("isPublic" in input) changes.is_public = boolean(input.isPublic);
  if (!Object.keys(changes).length) throw new ApiError("No fields to update");
  const row = checked(
    await supabase
      .from("lists")
      .update(changes)
      .eq("id", integer(id))
      .eq("user_id", user.id)
      .select("*")
      .maybeSingle(),
  );
  if (!row) throw new ApiError("Not found", 404);
  return json({ list: row });
});
export const DELETE = endpoint(async (_req, { id }) => {
  const { supabase, user } = await authenticated();
  const row = checked(
    await supabase
      .from("lists")
      .delete()
      .eq("id", integer(id))
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle(),
  );
  if (!row) throw new ApiError("Not found", 404);
  return json({ success: true });
});
