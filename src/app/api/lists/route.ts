import {
  allRows,
  endpoint,
  json,
  body,
  authenticated,
  checked,
  text,
  boolean,
} from "@/lib/api";
export const GET = endpoint(async () => {
  const { supabase, user } = await authenticated();
  return json({
    lists: await allRows((from, to) =>
      supabase
        .from("list_summaries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
  });
});
export const POST = endpoint(async (req) => {
  const { supabase, user } = await authenticated();
  const input = await body(req);
  const row = checked(
    await supabase
      .from("lists")
      .insert({
        user_id: user.id,
        name: text(input.name, "List name", 100, true),
        description: text(input.description, "Description", 2000),
        is_public:
          input.isPublic === undefined ? false : boolean(input.isPublic),
      })
      .select("*")
      .single(),
  );
  return json({ list: row }, 201);
});
