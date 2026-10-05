"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo, Avatar, Cover, displayName, btnPrimary, btnGhost } from "../ui";

type Review = {
  id: number;
  body: string;
  created_at: string;
  book_id: number;
  title: string;
  author: string | null;
  cover_url: string | null;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
};

export default function PublicReviewsPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/reviews/public?limit=30")
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setLoggedIn(Boolean(d.user)));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href={loggedIn ? "/books" : "/"}>
            <Logo />
          </Link>
          <nav className="flex items-center gap-2">
            {loggedIn ? (
              <Link href="/books" className={btnGhost}>
                Library
              </Link>
            ) : (
              <>
                <Link href="/login" className={btnGhost}>
                  Log in
                </Link>
                <Link href="/signup" className={btnPrimary}>
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-50">
          Reviews
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Recent reviews from readers with public profiles.
        </p>

        {reviews === null ? (
          <p className="py-10 text-sm text-zinc-500">Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-400">
            No public reviews yet.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-zinc-800 border-t border-zinc-800">
            {reviews.map((r) => (
              <li key={r.id} className="flex gap-5 py-6">
                <Cover src={r.cover_url} className="h-[90px] w-[60px]" />
                <article className="min-w-0 flex-1">
                  <Link
                    href={`/books/${r.book_id}`}
                    className="font-serif text-lg font-semibold leading-snug text-zinc-100 hover:underline"
                  >
                    {r.title}
                  </Link>
                  <p className="text-sm text-zinc-500">
                    {r.author ?? "Unknown author"}
                  </p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-300">
                    {r.body}
                  </p>
                  <footer className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                    <Avatar src={r.avatar_url} className="h-6 w-6" />
                    <Link
                      href={`/u/${r.user_id}`}
                      className="font-medium text-zinc-300 hover:underline"
                    >
                      {displayName(r.name)}
                    </Link>
                    <span aria-hidden>·</span>
                    <time dateTime={r.created_at}>
                      {new Date(r.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </footer>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
