import type { Database } from "@/lib/supabase/database.types";
import {
  endpoint,
  json,
  body,
  authenticated,
  checked,
  integer,
  ApiError,
} from "@/lib/api";
export const PATCH = endpoint(async (req, { id }) => {
  const { supabase, user } = await authenticated();
  const input = await body(req);
  const changes: Database["public"]["Tables"]["user_books"]["Update"] = {};
  if (input.status !== undefined) {
    if (!["to_read", "reading", "read"].includes(input.status as string))
      throw new ApiError("Invalid status");
    changes.status = input.status as string;
  }
  if (input.currentPage !== undefined)
    changes.current_page = integer(input.currentPage, "currentPage", 0);
  if (!Object.keys(changes).length) throw new ApiError("No fields to update");
  const row = checked(
    await supabase
      .from("user_books")
      .update(changes)
      .eq("id", integer(id))
      .eq("user_id", user.id)
      .select("id,status,current_page,finished_at")
      .maybeSingle(),
  );
  if (!row) throw new ApiError("Not found", 404);
  return json({ success: true, userBook: row });
});
export const DELETE = endpoint(async (_req, { id }) => {
  const { supabase, user } = await authenticated();
  const row = checked(
    await supabase
      .from("user_books")
      .delete()
      .eq("id", integer(id))
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle(),
  );
  if (!row) throw new ApiError("Not found", 404);
  return json({ success: true });
});
