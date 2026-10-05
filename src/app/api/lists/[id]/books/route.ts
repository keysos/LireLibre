import {
  endpoint,
  json,
  body,
  authenticated,
  checked,
  integer,
  ApiError,
} from "@/lib/api";
export const POST = endpoint(async (req, { id }) => {
  const { supabase, user } = await authenticated();
  const input = await body(req);
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
      .insert({ list_id: listId, book_id: integer(input.bookId, "bookId") })
      .select("id,book_id,added_at")
      .single(),
  );
  return json({ entry: row }, 201);
});
