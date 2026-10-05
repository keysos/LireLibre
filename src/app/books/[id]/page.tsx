"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiBookmark,
  FiBookOpen,
  FiCheck,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import Nav from "../../nav";
import {
  Cover,
  ProgressBar,
  SectionHeading,
  btnPrimary,
  btnSecondary,
  btnGhost,
  btnDanger,
  panelCls,
  textareaCls,
  labelCls,
  Avatar,
  displayName,
} from "../../ui";
import { Segmented, Select, StarRating } from "../../controls";

type Status = "to_read" | "reading" | "read";

type Book = {
  id: number;
  title: string;
  author: string | null;
  isbn: string | null;
  cover_url: string | null;
  description: string | null;
  published_date: string | null;
  number_of_pages: number | null;
};

type Review = {
  id: number;
  body: string;
  updated_at: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  is_public: boolean;
  mine: boolean;
};

type RatingSummary = {
  count: number;
  average: number | null;
  myRating: number | null;
};

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState<Status | "">("");
  const [userBookId, setUserBookId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(
    null,
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewDraft, setReviewDraft] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [lists, setLists] = useState<{ id: number; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  async function loadAll() {
    const [bookRes, statusRes, ratingRes, reviewsRes, listsRes] =
      await Promise.all([
        fetch(`/api/catalog/${id}`),
        fetch(`/api/books/status?bookId=${id}`),
        fetch(`/api/ratings?bookId=${id}`),
        fetch(`/api/reviews?bookId=${id}`),
        fetch(`/api/lists`),
      ]);

    if (bookRes.status === 401) return router.push("/login");
    if (bookRes.status === 404) return setNotFound(true);

    setBook((await bookRes.json()).book);
    const s = await statusRes.json();
    setStatus(s.userBook?.status ?? "");
    setUserBookId(s.userBook?.id ?? null);
    setCurrentPage(s.userBook?.current_page ?? 0);
    setRatingSummary(await ratingRes.json());
    setReviews((await reviewsRes.json()).reviews);
    setLists((await listsRes.json()).lists);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const flash = (m: string) => {
    setNotice(m);
    setTimeout(() => setNotice(null), 2500);
  };

  async function changeStatus(next: Status) {
    setStatus(next);
    await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: Number(id), status: next }),
    });
    loadAll();
  }

  async function saveProgress() {
    if (!userBookId) return;
    await fetch(`/api/books/${userBookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPage }),
    });
    flash("Progress saved");
  }

  async function rate(rating: number) {
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: Number(id), rating }),
    });
    setRatingSummary(await (await fetch(`/api/ratings?bookId=${id}`)).json());
  }

  async function clearRating() {
    await fetch(`/api/ratings?bookId=${id}`, { method: "DELETE" });
    setRatingSummary(await (await fetch(`/api/ratings?bookId=${id}`)).json());
  }

  async function addToList() {
    if (!selectedListId) return;
    const res = await fetch(`/api/lists/${selectedListId}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: Number(id) }),
    });
    flash(
      res.ok ? "Added to list" : ((await res.json()).error ?? "Could not add"),
    );
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewDraft.trim()) return;

    if (editingReviewId) {
      await fetch(`/api/reviews/${editingReviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reviewDraft }),
      });
    } else {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: Number(id), body: reviewDraft }),
      });
      if (!res.ok)
        return flash((await res.json()).error ?? "Could not post review");
    }

    setReviewDraft("");
    setEditingReviewId(null);
    setReviews(
      (await (await fetch(`/api/reviews?bookId=${id}`)).json()).reviews,
    );
  }

  async function deleteReview(reviewId: number) {
    await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  }

  if (notFound) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-sm text-zinc-300">This book could not be found.</p>
          <Link
            href="/books"
            className="mt-2 inline-block text-sm underline underline-offset-4"
          >
            Back to library
          </Link>
        </main>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen">
        <Nav />
        <p className="mx-auto max-w-5xl px-4 py-10 text-sm text-zinc-500">
          Loading...
        </p>
      </div>
    );
  }

  const myReview = reviews.find((r) => r.mine);
  const meta = [
    book.published_date && `First published ${book.published_date}`,
    book.number_of_pages && `${book.number_of_pages} pages`,
    book.isbn && `ISBN ${book.isbn}`,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          href="/books"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100"
        >
          <FiArrowLeft className="h-4 w-4" /> Library
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-[220px_1fr]">
          <div>
            <Cover
              src={book.cover_url}
              className="mx-auto aspect-[2/3] w-44 md:w-full"
            />
          </div>

          <div>
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-4xl">
              {book.title}
            </h1>
            <p className="mt-2 text-base text-zinc-400">
              {book.author ?? "Unknown author"}
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              {meta.length
                ? meta.join("   ·   ")
                : "No publication details available"}
            </p>

            <div className={`${panelCls} mt-6 divide-y divide-zinc-800`}>
              <div className="p-4">
                <p className={labelCls}>Shelf</p>
                <div className="mt-3 overflow-x-auto">
                  <Segmented
                    value={status}
                    onChange={changeStatus}
                    options={[
                      {
                        value: "to_read",
                        label: "Want to read",
                        icon: <FiBookmark className="h-3.5 w-3.5" />,
                      },
                      {
                        value: "reading",
                        label: "Reading",
                        icon: <FiBookOpen className="h-3.5 w-3.5" />,
                      },
                      {
                        value: "read",
                        label: "Finished",
                        icon: <FiCheck className="h-3.5 w-3.5" />,
                      },
                    ]}
                  />
                </div>

                {status === "reading" && (
                  <div className="mt-5">
                    <ProgressBar
                      value={currentPage}
                      max={book.number_of_pages ?? 0}
                    />
                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                      Page
                      <input
                        type="number"
                        min={0}
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                        className="h-8 w-20 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-center text-zinc-100 focus:border-zinc-500 focus:outline-none"
                      />
                      {book.number_of_pages
                        ? `of ${book.number_of_pages}`
                        : "(page count unavailable)"}
                      <button
                        onClick={saveProgress}
                        className={`${btnSecondary} ml-auto h-8`}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className={labelCls}>Your rating</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <StarRating
                    value={ratingSummary?.myRating ?? null}
                    onChange={rate}
                    onClear={clearRating}
                  />
                  {ratingSummary && ratingSummary.count > 0 && (
                    <span className="text-xs text-zinc-500">
                      Community average {ratingSummary.average?.toFixed(1)} from{" "}
                      {ratingSummary.count} rating
                      {ratingSummary.count > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {lists.length > 0 && (
                <div className="p-4">
                  <p className={labelCls}>Lists</p>
                  <div className="mt-3 flex gap-2">
                    <Select
                      className="flex-1"
                      value={selectedListId}
                      onChange={setSelectedListId}
                      placeholder="Choose a list"
                      options={lists.map((l) => ({
                        value: String(l.id),
                        label: l.name,
                      }))}
                    />
                    <button
                      onClick={addToList}
                      disabled={!selectedListId}
                      className={`${btnSecondary} h-10`}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {notice && (
              <p role="status" className="mt-3 text-sm text-zinc-400">
                {notice}
              </p>
            )}

            <section className="mt-10">
              <SectionHeading>About this book</SectionHeading>
              {book.description ? (
                <p className="max-w-prose whitespace-pre-line text-sm leading-7 text-zinc-300">
                  {book.description}
                </p>
              ) : (
                <p className="text-sm text-zinc-500">
                  No description is available for this book.
                </p>
              )}
            </section>
          </div>
        </div>

        <section className="mt-14 max-w-3xl md:ml-[260px]">
          <SectionHeading>
            Reviews{" "}
            <span className="ml-1 font-normal text-zinc-500">
              {reviews.length}
            </span>
          </SectionHeading>

          {(!myReview || editingReviewId) && (
            <form onSubmit={submitReview} className="mb-8 space-y-3">
              <textarea
                value={reviewDraft}
                onChange={(e) => setReviewDraft(e.target.value)}
                placeholder="Share what you thought of this book"
                rows={4}
                className={textareaCls}
              />
              <div className="flex gap-2">
                <button type="submit" className={btnPrimary}>
                  {editingReviewId ? "Save changes" : "Post review"}
                </button>
                {editingReviewId && (
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => {
                      setEditingReviewId(null);
                      setReviewDraft("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-zinc-500">No reviews yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-800">
              {reviews.map((r) => (
                <li key={r.id} className="flex gap-3 py-5">
                  <Avatar src={r.avatar_url} className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={r.mine ? "/profile" : `/u/${r.user_id}`}
                          className="truncate text-sm font-medium text-zinc-100 hover:underline"
                        >
                          {displayName(r.name)}
                        </Link>
                        {r.mine && (
                          <span className="ml-2 text-xs text-zinc-500">
                            You
                          </span>
                        )}
                        <time
                          className="ml-2 text-xs text-zinc-500"
                          dateTime={r.updated_at}
                        >
                          {new Date(r.updated_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </time>
                      </div>
                      {r.mine && (
                        <div className="flex">
                          <button
                            className={`${btnGhost} h-8 px-2`}
                            aria-label="Edit review"
                            onClick={() => {
                              setEditingReviewId(r.id);
                              setReviewDraft(r.body);
                            }}
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            className={`${btnDanger} h-8 px-2`}
                            aria-label="Delete review"
                            onClick={() => deleteReview(r.id)}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {r.mine && !r.is_public && (
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Only you can see this review while your profile is
                        private.
                      </p>
                    )}
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-zinc-300">
                      {r.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
