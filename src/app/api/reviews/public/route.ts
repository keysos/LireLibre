import { endpoint, json, checked, integer } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
export const GET = endpoint(async (req) => {
  const supabase = await createClient();
  const limit = integer(
    new URL(req.url).searchParams.get("limit") ?? 20,
    "limit",
    1,
    50,
  );
  const rows = checked(
    await supabase
      .from("reviews")
      .select(
        "id,body,created_at,user_id,book:books(id,title,author,cover_url),profile:profiles!inner(name,avatar_url,is_public)",
      )
      .eq("profile.is_public", true)
      .order("created_at", { ascending: false })
      .limit(limit),
  );
  return json({
    reviews: (rows ?? []).map(({ book, profile, ...row }) => ({
      ...row,
      ...book,
      id: row.id,
      book_id: book.id,
      ...profile,
    })),
  });
});
