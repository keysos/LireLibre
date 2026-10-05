import { endpoint, authenticated, body, ApiError, json } from "@/lib/api";
import { getWorkDetails } from "@/lib/openlibrary";
import { upsertExternalBook } from "@/lib/books";
export const POST = endpoint(async (req) => {
  await authenticated();
  const input = await body(req);
  if (
    typeof input.externalId !== "string" ||
    !/^\/works\/OL[0-9]+W$/.test(input.externalId)
  )
    throw new ApiError("Invalid Open Library ID");
  let canonical;
  try {
    canonical = await getWorkDetails(input.externalId);
  } catch {
    throw new ApiError("Open Library unavailable. Please try again.", 502);
  }
  return json({ book: await upsertExternalBook(canonical) });
});
