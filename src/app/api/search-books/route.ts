import {
  endpoint,
  authenticated,
  text,
  integer,
  ApiError,
  json,
} from "@/lib/api";
import { searchBooks } from "@/lib/openlibrary";
export const GET = endpoint(async (req) => {
  await authenticated();
  const query = new URL(req.url).searchParams;
  const q = text(query.get("q"), "Search", 200, true)!;
  const limit = integer(query.get("limit") ?? 20, "limit", 1, 50);
  try {
    return json({ results: await searchBooks(q, limit) });
  } catch {
    throw new ApiError("Open Library unavailable. Please try again.", 502);
  }
});
