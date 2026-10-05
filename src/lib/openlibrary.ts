const BASE = "https://openlibrary.org";
const COVERS = "https://covers.openlibrary.org";
export type ExternalBook = {
  source: "openlibrary";
  externalId: string;
  title: string;
  author: string | null;
  isbn: string | null;
  coverUrl: string | null;
  description: string | null;
  publishedDate: string | null;
  numberOfPages: number | null;
};
type SearchDoc = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
};
async function fetchJSON<T>(url: string, revalidate?: number): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "LireLibre/1.0" },
    signal: AbortSignal.timeout(10000),
    ...(revalidate ? { next: { revalidate } } : { cache: "no-store" as const }),
  });
  if (!res.ok) throw new Error("Open Library unavailable");
  return (await res.json()) as T;
}
export async function searchBooks(
  query: string,
  limit = 20,
  options: { revalidate?: number } = {},
): Promise<ExternalBook[]> {
  const url = new URL(`${BASE}/search.json`);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set(
    "fields",
    "key,title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median",
  );
  const data = await fetchJSON<{ docs: SearchDoc[] }>(
    url.toString(),
    options.revalidate,
  );
  return (data.docs ?? [])
    .filter((d) => /^\/works\/OL[0-9]+W$/.test(d.key))
    .map((d) => ({
      source: "openlibrary",
      externalId: d.key,
      title: d.title,
      author: d.author_name?.[0] ?? null,
      isbn: d.isbn?.[0] ?? null,
      coverUrl: d.cover_i ? `${COVERS}/b/id/${d.cover_i}-L.jpg` : null,
      description: null,
      publishedDate: d.first_publish_year ? String(d.first_publish_year) : null,
      numberOfPages: d.number_of_pages_median ?? null,
    }));
}
// Only canonical server-fetched fields are written to the shared catalog.
export async function getWorkDetails(
  externalId: string,
): Promise<ExternalBook> {
  if (!/^\/works\/OL[0-9]+W$/.test(externalId))
    throw new Error("Invalid Open Library ID");
  const work = await fetchJSON<{
    title?: string;
    description?: string | { value?: string };
    covers?: number[];
    first_publish_date?: string;
    authors?: { author?: { key?: string } }[];
  }>(`${BASE}${externalId}.json`);
  if (typeof work.title !== "string" || !work.title.trim())
    throw new Error("Invalid Open Library response");
  const authorNames = await Promise.all(
    (work.authors ?? []).slice(0, 5).map(async (a) => {
      const key = a.author?.key;
      if (!key || !/^\/authors\/OL[0-9]+A$/.test(key)) return null;
      try {
        return (
          (await fetchJSON<{ name?: string }>(`${BASE}${key}.json`)).name ??
          null
        );
      } catch {
        return null;
      }
    }),
  );
  // Edition supplies page count and ISBN, absent on most work records.
  let edition:
    | {
        number_of_pages?: number;
        isbn_13?: string[];
        isbn_10?: string[];
        publish_date?: string;
      }
    | undefined;
  try {
    edition = (
      await fetchJSON<{ entries: (typeof edition)[] }>(
        `${BASE}${externalId}/editions.json?limit=1`,
      )
    ).entries?.[0];
  } catch {
    /* Work itself remains valid. */
  }
  const description =
    typeof work.description === "string"
      ? work.description
      : (work.description?.value ?? null);
  return {
    source: "openlibrary",
    externalId,
    title: work.title.slice(0, 1000),
    author: authorNames.filter(Boolean).join(", ").slice(0, 2000) || null,
    isbn: edition?.isbn_13?.[0] ?? edition?.isbn_10?.[0] ?? null,
    coverUrl:
      work.covers?.[0] && work.covers[0] > 0
        ? `${COVERS}/b/id/${work.covers[0]}-L.jpg`
        : null,
    description: description?.slice(0, 50000) ?? null,
    publishedDate: work.first_publish_date ?? edition?.publish_date ?? null,
    numberOfPages:
      edition?.number_of_pages && edition.number_of_pages > 0
        ? edition.number_of_pages
        : null,
  };
}
