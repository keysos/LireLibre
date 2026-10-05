import {
  endpoint,
  json,
  body,
  authenticated,
  checked,
  integer,
} from "@/lib/api";
export const GET = endpoint(async (req) => {
  const { supabase, user } = await authenticated();
  const year = integer(
    new URL(req.url).searchParams.get("year") ?? new Date().getFullYear(),
    "year",
    2000,
    2200,
  );
  const goal = checked(
    await supabase
      .from("reading_goals")
      .select("target_books")
      .eq("user_id", user.id)
      .eq("year", year)
      .maybeSingle(),
  );
  const finished = checked(
    await supabase.rpc("goal_progress", { p_year: year }),
  );
  return json({
    year,
    targetBooks: goal?.target_books ?? null,
    finishedBooks: Number(finished),
  });
});
export const POST = endpoint(async (req) => {
  const { supabase, user } = await authenticated();
  const input = await body(req);
  const goal = checked(
    await supabase
      .from("reading_goals")
      .upsert(
        {
          user_id: user.id,
          year: integer(
            input.year ?? new Date().getFullYear(),
            "year",
            2000,
            2200,
          ),
          target_books: integer(input.targetBooks, "targetBooks"),
        },
        { onConflict: "user_id,year" },
      )
      .select("id,year,target_books")
      .single(),
  );
  return json({ goal });
});
