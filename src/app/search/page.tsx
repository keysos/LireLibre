"use client";
import { clientFetch } from "@/lib/client-fetch";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiBookmark,
  FiBookOpen,
  FiCheck,
  FiPlus,
  FiChevronDown,
} from "react-icons/fi";
import Nav from "../nav";
import { Cover, btnSecondary, btnPrimary, inputCls } from "../ui";
import { Menu } from "../controls";

type Status = "to_read" | "reading" | "read";

type ExternalBook = {
  source: string;
  externalId: string;
  title: string;
  author: string | null;
  isbn: string | null;
  coverUrl: string | null;
  publishedDate: string | null;
  numberOfPages: number | null;
};

export default function DiscoverPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ExternalBook[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<string, string>>({});

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    const res = await clientFetch(
      `/api/search-books?q=${encodeURIComponent(query)}`,
    );
    if (res.status === 401) return router.push("/login");
    setLoading(false);

    if (!res.ok) return setError("Search failed. Please try again.");
    setResults((await res.json()).results);
  }

  async function importBook(book: ExternalBook): Promise<number | null> {
    const res = await clientFetch("/api/catalog/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ externalId: book.externalId }),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Unable to import book");
      return null;
    }
    return (await res.json()).book.id as number;
  }

  async function open(book: ExternalBook) {
    const id = await importBook(book);
    if (id) router.push(`/books/${id}`);
  }

  async function add(book: ExternalBook, status: Status, label: string) {
    const bookId = await importBook(book);
    if (!bookId) return;
    const res = await clientFetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, status }),
    });
    if (!res.ok)
      return setError((await res.json()).error ?? "Unable to add book");
    setAdded((prev) => ({ ...prev, [book.externalId]: label }));
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-50">
          Discover
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Search the Open Library catalog and add books to your shelves.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              placeholder="Title, author, or ISBN"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${inputCls} pl-9`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`${btnPrimary} h-10 px-5`}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        {results !== null && results.length === 0 && !error && (
          <p className="py-12 text-center text-sm text-zinc-400">
            No results. Try a different search.
          </p>
        )}

        {results && results.length > 0 && (
          <>
            <p className="mt-8 text-xs text-zinc-500">
              {results.length} results
            </p>
            <ul className="mt-2 divide-y divide-zinc-800 border-t border-zinc-800">
              {results.map((book) => (
                <li key={book.externalId} className="flex gap-4 py-5">
                  <Cover src={book.coverUrl} className="h-[96px] w-16" />
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <button
                        onClick={() => open(book)}
                        className="line-clamp-2 text-left font-medium text-zinc-100 hover:underline"
                      >
                        {book.title}
                      </button>
                      <p className="mt-0.5 truncate text-sm text-zinc-400">
                        {book.author ?? "Unknown author"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {[
                          book.publishedDate,
                          book.numberOfPages
                            ? `${book.numberOfPages} pages`
                            : null,
                        ]
                          .filter(Boolean)
                          .join("  ·  ")}
                      </p>
                    </div>

                    {added[book.externalId] ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
                        <FiCheck className="h-4 w-4" /> {added[book.externalId]}
                      </span>
                    ) : (
                      <Menu
                        align="right"
                        triggerClassName={`${btnSecondary} flex-shrink-0`}
                        trigger={
                          <>
                            <FiPlus className="h-4 w-4" /> Add to shelf{" "}
                            <FiChevronDown className="h-4 w-4 text-zinc-500" />
                          </>
                        }
                        items={[
                          {
                            label: "Want to read",
                            icon: <FiBookmark className="h-4 w-4" />,
                            onSelect: () =>
                              add(book, "to_read", "Want to read"),
                          },
                          {
                            label: "Currently reading",
                            icon: <FiBookOpen className="h-4 w-4" />,
                            onSelect: () =>
                              add(book, "reading", "Currently reading"),
                          },
                          {
                            label: "Finished",
                            icon: <FiCheck className="h-4 w-4" />,
                            onSelect: () => add(book, "read", "Finished"),
                          },
                        ]}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
