import { endpoint, authenticated, integer, ApiError, json } from "@/lib/api";
import { getBookById } from "@/lib/books";
export const GET = endpoint(async (_req, { id }) => {
  await authenticated();
  const book = await getBookById(integer(id));
  if (!book) throw new ApiError("Book not found", 404);
  return json({ book });
});
