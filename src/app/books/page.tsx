"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiPlus,
  FiTrash2,
  FiMoreHorizontal,
  FiBookmark,
  FiBookOpen,
  FiCheck,
} from "react-icons/fi";
import Nav from "../nav";
import { Cover, ProgressBar, btnPrimary, panelCls } from "../ui";
import { Menu, StarRating } from "../controls";

type Status = "to_read" | "reading" | "read";

type UserBook = {
  id: number;
  status: Status;
  current_page: number;
  finished_at: string | null;
  book_id: number;
  title: string;
  author: string | null;
  cover_url: string | null;
  number_of_pages: number | null;
  rating: number | null;
};

const TABS: { value: Status; label: string }[] = [
  { value: "reading", label: "Currently reading" },
  { value: "to_read", label: "Want to read" },
  { value: "read", label: "Finished" },
];

type Goal = { year: number; targetBooks: number | null; finishedBooks: number };

export default function LibraryPage() {
  const router = useRouter();
  const [books, setBooks] = useState<UserBook[] | null>(null);
  const [tab, setTab] = useState<Status>("reading");
  const [goal, setGoal] = useState<Goal | null>(null);

  async function load() {
    const res = await fetch("/api/books");
    if (res.status === 401) return router.push("/login");
    setBooks((await res.json()).books);
    setGoal(await (await fetch("/api/reading-goal")).json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function patch(b: UserBook, body: object) {
    await fetch(`/api/books/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  async function rate(b: UserBook, rating: number) {
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: b.book_id, rating }),
    });
    load();
  }

  async function clearRating(b: UserBook) {
    await fetch(`/api/ratings?bookId=${b.book_id}`, { method: "DELETE" });
    load();
  }

  async function remove(b: UserBook) {
    await fetch(`/api/books/${b.id}`, { method: "DELETE" });
    load();
  }

  const count = (s: Status) => books?.filter((b) => b.status === s).length ?? 0;
  const shown = books?.filter((b) => b.status === tab) ?? [];

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-50">
              Library
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {books
                ? `${books.length} book${books.length === 1 ? "" : "s"} on your shelves`
                : " "}
            </p>
          </div>
          <Link href="/search" className={btnPrimary}>
            <FiPlus className="h-4 w-4" /> Add a book
          </Link>
        </div>

        {goal?.targetBooks ? (
          <div
            className={`${panelCls} mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6`}
          >
            <div className="sm:w-48">
              <p className="text-xs text-zinc-500">{goal.year} reading goal</p>
              <p className="text-sm font-medium text-zinc-100">
                {goal.finishedBooks} of {goal.targetBooks} books
              </p>
            </div>
            <ProgressBar
              value={goal.finishedBooks}
              max={goal.targetBooks}
              className="flex-1"
            />
          </div>
        ) : null}

        <div
          className="mt-8 flex gap-6 overflow-x-auto border-b border-zinc-800"
          role="tablist"
        >
          {TABS.map((t) => (
            <button
              key={t.value}
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => setTab(t.value)}
              className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                tab === t.value
                  ? "border-zinc-100 text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}{" "}
              <span className="ml-1 text-zinc-500">{count(t.value)}</span>
            </button>
          ))}
        </div>

        {books === null ? (
          <p className="py-10 text-sm text-zinc-500">Loading...</p>
        ) : shown.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-300">Nothing on this shelf yet.</p>
            <Link
              href="/search"
              className="mt-2 inline-block text-sm text-zinc-100 underline underline-offset-4"
            >
              Find a book to add
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {shown.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <Cover src={b.cover_url} className="h-[84px] w-14" />
                  <div className="min-w-0">
                    <Link
                      href={`/books/${b.book_id}`}
                      className="line-clamp-2 font-medium text-zinc-100 hover:underline"
                    >
                      {b.title}
                    </Link>
                    <p className="truncate text-sm text-zinc-500">
                      {b.author ?? "Unknown author"}
                    </p>
                    {b.status === "read" && b.finished_at && (
                      <p className="mt-1 text-xs text-zinc-500">
                        Finished{" "}
                        {new Date(b.finished_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {b.status === "reading" && (
                  <div className="sm:w-56">
                    <ProgressBar
                      value={b.current_page}
                      max={b.number_of_pages ?? 0}
                    />
                    <label className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                      Page
                      <input
                        type="number"
                        min={0}
                        max={b.number_of_pages ?? undefined}
                        defaultValue={b.current_page}
                        onBlur={(e) =>
                          Number(e.target.value) !== b.current_page &&
                          patch(b, { currentPage: Number(e.target.value) })
                        }
                        className="h-7 w-16 rounded border border-zinc-800 bg-zinc-900 px-2 text-center text-zinc-100 focus:border-zinc-500 focus:outline-none"
                      />
                      {b.number_of_pages ? `of ${b.number_of_pages}` : ""}
                    </label>
                  </div>
                )}

                <div className="sm:w-40">
                  <StarRating
                    value={b.rating}
                    onChange={(n) => rate(b, n)}
                    onClear={() => clearRating(b)}
                    size="sm"
                    showLabel={false}
                  />
                </div>

                <Menu
                  align="right"
                  label="Book actions"
                  triggerClassName="rounded-md p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100"
                  trigger={<FiMoreHorizontal className="h-5 w-5" />}
                  items={[
                    ...(b.status !== "to_read"
                      ? [
                          {
                            label: "Move to Want to read",
                            icon: <FiBookmark className="h-4 w-4" />,
                            onSelect: () => patch(b, { status: "to_read" }),
                          },
                        ]
                      : []),
                    ...(b.status !== "reading"
                      ? [
                          {
                            label: "Move to Currently reading",
                            icon: <FiBookOpen className="h-4 w-4" />,
                            onSelect: () => patch(b, { status: "reading" }),
                          },
                        ]
                      : []),
                    ...(b.status !== "read"
                      ? [
                          {
                            label: "Mark as finished",
                            icon: <FiCheck className="h-4 w-4" />,
                            onSelect: () => patch(b, { status: "read" }),
                          },
                        ]
                      : []),
                    {
                      label: "Remove from library",
                      icon: <FiTrash2 className="h-4 w-4" />,
                      onSelect: () => remove(b),
                      danger: true,
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
