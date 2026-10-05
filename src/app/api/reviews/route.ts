import {
  allRows,
  endpoint,
  json,
  body,
  authenticated,
  checked,
  integer,
  text,
} from "@/lib/api";
export const GET = endpoint(async (req) => {
  const { supabase, user } = await authenticated();
  const bookId = integer(new URL(req.url).searchParams.get("bookId"), "bookId");
  const rows = await allRows((from, to) =>
    supabase
      .from("reviews")
      .select("*,profile:profiles(name,avatar_url,is_public)")
      .eq("book_id", bookId)
      .order("updated_at", { ascending: false })
      .order("id")
      .range(from, to),
  );
  const reviews = (rows ?? []).map(({ profile, ...row }) => ({
    ...row,
    ...profile,
    mine: row.user_id === user.id,
  }));
  reviews.sort((a, b) => Number(b.mine) - Number(a.mine));
  return json({ reviews });
});
export const POST = endpoint(async (req) => {
  const { supabase, user } = await authenticated();
  const input = await body(req);
  const row = checked(
    await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        book_id: integer(input.bookId, "bookId"),
        body: text(input.body, "Review", 10000, true),
      })
      .select("*")
      .single(),
  );
  return json({ review: row }, 201);
});
