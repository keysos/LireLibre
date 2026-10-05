import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { allRows, checked } from "@/lib/api";
export async function profileData(
  supabase: SupabaseClient<Database>,
  userId: string,
  publicOnly = false,
) {
  const [summary, reviews, ratings, lists] = await Promise.all([
    supabase.rpc("profile_summary", { p_user_id: userId }),
    allRows((from, to) =>
      supabase
        .from("reviews")
        .select("*,book:books(id,title,author,cover_url)")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
    publicOnly
      ? Promise.resolve([])
      : allRows((from, to) =>
          supabase
            .from("ratings")
            .select("*,book:books(id,title,author,cover_url)")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false })
            .order("id")
            .range(from, to),
        ),
    allRows((from, to) => {
      let query = supabase
        .from("list_summaries")
        .select("*")
        .eq("user_id", userId);
      if (publicOnly) query = query.eq("is_public", true);
      return query
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to);
    }),
  ]);
  const aggregate = checked(summary) as {
    statusCounts: Record<string, number>;
    stats: {
      books_this_year: number;
      pages_read: number;
      average_rating_given: number | null;
    };
  };
  return {
    ...aggregate,
    reviews: reviews.map(({ book, ...row }) => ({
      ...row,
      ...book,
      id: row.id,
      book_id: book.id,
    })),
    ratings: ratings.map(({ book, ...row }) => ({
      ...row,
      ...book,
      id: row.id,
      book_id: book.id,
    })),
    lists,
  };
}
