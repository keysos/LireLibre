/** One-off migration into a NEW Supabase project. Node >=22.
 * Never run this on the browser or commit legacy-data.json/checkpoint.
 * Accounts get a random unknown password: confirmed users must use Forgot password.
 * Unconfirmed users receive Supabase invitations; configure the invite template first.
 * The process is resumable, but not a cross-service transaction. Backup first.
 */
import fs from "node:fs";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const inputPath = process.argv[2];
if (!inputPath)
  throw new Error(
    "Usage: node --env-file=.env.local scripts/import-legacy.mjs legacy-data.json",
  );
const project = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!project || !process.env.SUPABASE_SECRET_KEY || !process.env.APP_URL)
  throw new Error("Fill .env.local first");
const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const tables = [
  "users",
  "books",
  "user_books",
  "ratings",
  "reviews",
  "lists",
  "list_books",
  "reading_goals",
];
for (const t of tables)
  if (!Array.isArray(data[t])) throw new Error(`Missing array: ${t}`);
const checkpointPath = "migration-user-map.json";
let checkpoint = fs.existsSync(checkpointPath)
  ? JSON.parse(fs.readFileSync(checkpointPath, "utf8"))
  : { project, map: {} };
if (checkpoint.project !== project)
  throw new Error("Checkpoint belongs to another project");
const admin = createClient(project, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const existing = [];
for (let page = 1; ; page++) {
  const { data: result, error } = await admin.auth.admin.listUsers({
    page,
    perPage: 1000,
  });
  if (error) throw new Error("Unable to list Auth users");
  existing.push(...result.users);
  if (result.users.length < 1000) break;
}
function save() {
  fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2), {
    mode: 0o600,
  });
}
for (const user of data.users) {
  if (!Number.isInteger(user.id) || typeof user.email !== "string")
    throw new Error("Invalid legacy user");
  const oldId = String(user.id),
    email = user.email.trim().toLowerCase();
  let id = checkpoint.map[oldId];
  const found = existing.find((u) => u.email?.toLowerCase() === email);
  if (id) {
    const matched = existing.find((u) => u.id === id);
    if (!matched || matched.email?.toLowerCase() !== email)
      throw new Error(`Invalid checkpoint for user ${oldId}`);
  } else if (found) {
    if (found.user_metadata?.legacy_user_id !== user.id)
      throw new Error(
        `Email conflict for legacy user ${oldId}. Use a new target project.`,
      );
    id = found.id;
  } else {
    const metadata = { name: user.name, legacy_user_id: user.id };
    const result = user.email_verified_at
      ? await admin.auth.admin.createUser({
          email,
          password: crypto.randomBytes(48).toString("base64url"),
          email_confirm: true,
          user_metadata: metadata,
        })
      : await admin.auth.admin.inviteUserByEmail(email, {
          data: metadata,
          redirectTo: `${process.env.APP_URL}/auth/confirm`,
        });
    if (result.error || !result.data.user)
      throw new Error(
        `Unable to create legacy user ${oldId}. Check Auth/SMTP configuration.`,
      );
    id = result.data.user.id;
    existing.push(result.data.user);
  }
  checkpoint.map[oldId] = id;
  save();
  const { error } = await admin
    .from("profiles")
    .update({
      name: user.name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      is_public: user.is_public,
      created_at: user.created_at,
    })
    .eq("id", id);
  if (error) throw new Error(`Invalid profile data for legacy user ${oldId}`);
}
const fields = {
  books: [
    "id",
    "title",
    "author",
    "isbn",
    "cover_url",
    "source",
    "external_id",
    "description",
    "published_date",
    "number_of_pages",
    "created_at",
  ],
  user_books: [
    "id",
    "user_id",
    "book_id",
    "status",
    "current_page",
    "finished_at",
    "added_at",
  ],
  ratings: ["id", "user_id", "book_id", "rating", "created_at", "updated_at"],
  reviews: ["id", "user_id", "book_id", "body", "created_at", "updated_at"],
  lists: ["id", "user_id", "name", "description", "is_public", "created_at"],
  list_books: ["id", "list_id", "book_id", "added_at"],
  reading_goals: [
    "id",
    "user_id",
    "year",
    "target_books",
    "created_at",
    "updated_at",
  ],
};
for (const [table, columns] of Object.entries(fields)) {
  const rows = data[table].map((old) => {
    const row = Object.fromEntries(
      columns.filter((k) => old[k] !== undefined).map((k) => [k, old[k]]),
    );
    if ("user_id" in row) {
      const id = checkpoint.map[String(row.user_id)];
      if (!id) throw new Error(`Missing user mapping in ${table}`);
      row.user_id = id;
    }
    return row;
  });
  for (let start = 0; start < rows.length; start += 100) {
    const { error } = await admin
      .from(table)
      .upsert(rows.slice(start, start + 100), { onConflict: "id" });
    if (error)
      throw new Error(
        `Import failed: ${table}, batch ${start}. Check constraints and duplicate IDs. Resume after correction.`,
      );
  }
  console.log(`${table}: ${rows.length} rows imported`);
}
console.log(
  "Import complete. Run scripts/reset-sequences.sql in Supabase SQL Editor, then verify counts. Old passwords no longer work.",
);
