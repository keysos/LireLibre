import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checked } from "@/lib/api";
import type { ExternalBook } from "@/lib/openlibrary";
export type BookRow = {
  id: number;
  title: string;
  author: string | null;
  isbn: string | null;
  cover_url: string | null;
  description: string | null;
  published_date: string | null;
  number_of_pages: number | null;
  source: string;
  external_id: string | null;
};
export async function upsertExternalBook(book: ExternalBook): Promise<BookRow> {
  const admin = createAdminClient();
  return checked(
    await admin
      .from("books")
      .upsert(
        {
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          cover_url: book.coverUrl,
          description: book.description,
          published_date: book.publishedDate,
          number_of_pages: book.numberOfPages,
          source: "openlibrary",
          external_id: book.externalId,
        },
        { onConflict: "source,external_id" },
      )
      .select("*")
      .single(),
  ) as BookRow;
}
export async function getBookById(id: number): Promise<BookRow | null> {
  const supabase = await createClient();
  return checked(
    await supabase.from("books").select("*").eq("id", id).maybeSingle(),
  ) as BookRow | null;
}
