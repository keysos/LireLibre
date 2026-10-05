import {
  endpoint,
  json,
  authenticated,
  checked,
  integer,
  ApiError,
} from "@/lib/api";
export const DELETE = endpoint(async (_req, { id, bookId }) => {
  const { supabase, user } = await authenticated();
  const listId = integer(id);
  const owns = checked(
    await supabase
      .from("lists")
      .select("id")
      .eq("id", listId)
      .eq("user_id", user.id)
      .maybeSingle(),
  );
  if (!owns) throw new ApiError("Not found", 404);
  const row = checked(
    await supabase
      .from("list_books")
      .delete()
      .eq("list_id", listId)
      .eq("book_id", integer(bookId))
      .select("id")
      .maybeSingle(),
  );
  if (!row) throw new ApiError("Not found", 404);
  return json({ success: true });
});
