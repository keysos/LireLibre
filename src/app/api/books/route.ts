import {
  allRows,
  endpoint,
  json,
  body,
  authenticated,
  checked,
  integer,
  ApiError,
} from "@/lib/api";
export const GET = endpoint(async () => {
  const { supabase, user } = await authenticated();
  const rows = await allRows((from, to) =>
    supabase
      .from("user_books")
      .select("*,book:books(*)")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false })
      .order("id")
      .range(from, to),
  );
  const ratings = await allRows((from, to) =>
    supabase
      .from("ratings")
      .select("book_id,rating")
      .eq("user_id", user.id)
      .order("id")
      .range(from, to),
  );
  return json({
    books: (rows ?? []).map(({ book, ...row }) => ({
      ...row,
      ...book,
      id: row.id,
      book_id: book.id,
      rating:
        (ratings ?? []).find((r) => r.book_id === book.id)?.rating ?? null,
    })),
  });
});
export const POST = endpoint(async (req) => {
  const { supabase, user } = await authenticated();
  const input = await body(req);
  const bookId = integer(input.bookId, "bookId");
  const status = input.status ?? "to_read";
  if (!["to_read", "reading", "read"].includes(status as string))
    throw new ApiError("Invalid status");
  const row = checked(
    await supabase
      .from("user_books")
      .upsert(
        { user_id: user.id, book_id: bookId, status: status as string },
        { onConflict: "user_id,book_id" },
      )
      .select("id,status")
      .single(),
  );
  return json({ success: true, userBookId: row!.id, bookId }, 201);
});
