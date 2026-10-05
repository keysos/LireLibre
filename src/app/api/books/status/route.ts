import { endpoint, json, authenticated, checked, integer } from "@/lib/api";
export const GET = endpoint(async (req) => {
  const { supabase, user } = await authenticated();
  const id = integer(new URL(req.url).searchParams.get("bookId"), "bookId");
  return json({
    userBook: checked(
      await supabase
        .from("user_books")
        .select("id,status,current_page,finished_at")
        .eq("user_id", user.id)
        .eq("book_id", id)
        .maybeSingle(),
    ),
  });
});
