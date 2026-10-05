import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`);
await db.exec(
  fs.readFileSync(
    new URL("../supabase/migrations/001_v1_schema.sql", import.meta.url),
    "utf8",
  ),
);
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222",
  c = "33333333-3333-4333-8333-333333333333";
await db.exec(
  `insert into auth.users(id,email,raw_user_meta_data) values('${a}','a@example.com','{"name":"A"}'),('${b}','b@example.com','{"name":"B"}'),('${c}','c@example.com','{}');insert into public.books(title,source,external_id)values('Book','openlibrary','/works/OL1W');`,
);
assert.equal(
  (await db.query("select count(*)::int as n from profiles")).rows[0].n,
  3,
);
async function asUser(id, sql) {
  await db.exec(
    `set role authenticated;select set_config('request.jwt.claim.sub','${id}',false);`,
  );
  try {
    return (await db.exec(sql)).at(-1);
  } finally {
    await db.exec("reset role");
  }
}
async function denied(id, sql) {
  await assert.rejects(() => asUser(id, sql));
}
await asUser(
  a,
  `insert into follows(follower_id,following_id)values('${a}','${b}')`,
);
await asUser(
  a,
  `insert into follows(follower_id,following_id)values('${a}','${b}') on conflict(follower_id,following_id) do nothing`,
);
assert.equal(
  (await asUser(c, "select count(*)::int as n from follows")).rows[0].n,
  1,
);
await asUser(
  a,
  `delete from follows where follower_id='${a}' and following_id='${b}'`,
);
assert.equal(
  (await asUser(c, "select count(*)::int as n from follows")).rows[0].n,
  0,
);
await asUser(
  a,
  `insert into follows(follower_id,following_id)values('${a}','${b}')`,
);
await denied(
  a,
  `insert into follows(follower_id,following_id)values('${b}','${c}')`,
);
await denied(
  a,
  `insert into follows(follower_id,following_id)values('${a}','${a}')`,
);
await denied(a, `update follows set following_id='${c}'`);
assert.equal(
  (await asUser(c, `delete from follows where follower_id='${a}' returning *`))
    .rows.length,
  0,
);
await db.exec("set role anon");
await assert.rejects(() => db.query("select * from follows"));
await db.exec("reset role");
await asUser(
  b,
  `insert into reviews(user_id,book_id,body)values('${b}',1,'Review');insert into user_books(user_id,book_id,status)values('${b}',1,'read');insert into ratings(user_id,book_id,rating)values('${b}',1,5);insert into lists(user_id,name,is_public)values('${b}','List',true);insert into list_books(list_id,book_id)values(1,1);insert into reading_goals(user_id,year,target_books)values('${b}',2026,10);`,
);
assert.equal((await asUser(a, "select * from reviews")).rows.length, 1);
assert.equal(
  (await asUser(a, "select * from list_summaries")).rows[0].book_count,
  1,
);
assert.equal((await asUser(a, "select * from reading_goals")).rows.length, 0);
await denied(a, `insert into list_books(list_id,book_id)values(1,1)`);
await denied(
  a,
  `insert into ratings(user_id,book_id,rating)values('${b}',1,2)`,
);
assert.equal(
  (
    await asUser(
      a,
      `update reviews set body='Stolen' where user_id='${b}' returning *`,
    )
  ).rows.length,
  0,
);
await asUser(b, `update profiles set is_public=false where id='${b}'`);
for (const t of [
  "profiles",
  "reviews",
  "user_books",
  "ratings",
  "lists",
  "list_books",
  "list_summaries",
]) {
  const result = await asUser(a, `select * from ${t}`);
  if (t === "profiles")
    assert.equal(
      result.rows.some((r) => r.id === b),
      false,
    );
  else assert.equal(result.rows.length, 0, `private ${t}`);
}
assert.equal((await asUser(b, "select * from reviews")).rows.length, 1);
assert.equal(
  (await asUser(a, `select profile_summary('${b}') as data`)).rows[0].data
    .statusCounts.read,
  0,
);
await denied(a, `update profiles set id='${c}' where id='${a}'`);
await denied(a, `insert into books(title,source)values('Hacked','manual')`);
await denied(a, `update books set title='Hacked' where id=1`);
await asUser(
  a,
  `insert into user_books(user_id,book_id,status)values('${a}',1,'read')`,
);
assert.ok(
  (await asUser(a, `select finished_at from user_books where user_id='${a}'`))
    .rows[0].finished_at,
);
await asUser(a, `update user_books set status='reading' where user_id='${a}'`);
assert.equal(
  (await asUser(a, `select finished_at from user_books where user_id='${a}'`))
    .rows[0].finished_at,
  null,
);
await db.exec(`delete from auth.users where id='${b}'`);
assert.equal((await db.query("select * from follows")).rows.length, 0);
assert.equal(
  (await db.query(`select * from profiles where id='${b}'`)).rows.length,
  0,
);
await db.exec(
  "insert into books(id,title,source)values(101,'Imported','manual')",
);
await db.exec(
  fs.readFileSync(
    new URL("../scripts/reset-sequences.sql", import.meta.url),
    "utf8",
  ),
);
assert.equal(
  (
    await db.query(
      "insert into books(title,source)values('Next','manual') returning id",
    )
  ).rows[0].id,
  102,
);
console.log(
  "Migration executed; RLS, trigger, follows, FK, privacy, ownership and cascade checks passed.",
);
await db.close();
