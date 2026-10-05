import {
  endpoint,
  json,
  body,
  authenticated,
  checked,
  integer,
  ApiError,
} from "@/lib/api";
export const GET = endpoint(async (req) => {
  const { supabase } = await authenticated();
  const bookId = integer(new URL(req.url).searchParams.get("bookId"), "bookId");
  return json(
    checked(await supabase.rpc("rating_summary", { p_book_id: bookId })),
  );
});
export const POST = endpoint(async (req) => {
  const { supabase, user } = await authenticated();
  const input = await body(req);
  const row = checked(
    await supabase
      .from("ratings")
      .upsert(
        {
          user_id: user.id,
          book_id: integer(input.bookId, "bookId"),
          rating: integer(input.rating, "rating", 1, 5),
        },
        { onConflict: "user_id,book_id" },
      )
      .select("id,book_id,rating")
      .single(),
  );
  return json({ rating: row });
});
export const DELETE = endpoint(async (req) => {
  const { supabase, user } = await authenticated();
  const bookId = integer(new URL(req.url).searchParams.get("bookId"), "bookId");
  const row = checked(
    await supabase
      .from("ratings")
      .delete()
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .select("id")
      .maybeSingle(),
  );
  if (!row) throw new ApiError("Not found", 404);
  return json({ success: true });
});
