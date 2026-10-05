"use client";
import FollowPanel from "../../follow-panel";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { FiList } from "react-icons/fi";
import {
  Logo,
  Avatar,
  SectionHeading,
  displayName,
  btnGhost,
  panelCls,
} from "../../ui";

type Data = {
  user: {
    id: string;
    name: string | null;
    bio: string | null;
    avatar_url: string | null;
    created_at: string;
  };
  statusCounts: Record<string, number>;
  lists: {
    id: number;
    name: string;
    description: string | null;
    book_count: number;
  }[];
  reviews: {
    id: number;
    body: string;
    book_id: number;
    title: string;
    author: string | null;
  }[];
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ProfileContent key={id} id={id} />;
}
function ProfileContent({ id }: { id: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");

  useEffect(() => {
    fetch(`/api/users/${id}/public`)
      .then(async (r) => {
        if (!r.ok) return setState("missing");
        setData(await r.json());
        setState("ok");
      })
      .catch(() => setState("missing"));
  }, [id]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/reviews" className={btnGhost}>
            Reviews
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {state === "loading" && (
          <p className="text-sm text-zinc-500">Loading...</p>
        )}
        {state === "missing" && (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-300">
              This profile is private or does not exist.
            </p>
          </div>
        )}

        {state !== "loading" && <FollowPanel userId={id} />}

        {data && (
          <>
            <section className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar src={data.user.avatar_url} className="h-24 w-24" />
              <div>
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-50">
                  {displayName(data.user.name)}
                </h1>
                {data.user.bio && (
                  <p className="mt-2 max-w-prose text-sm leading-6 text-zinc-300">
                    {data.user.bio}
                  </p>
                )}
                <p className="mt-3 text-xs text-zinc-500">
                  {data.statusCounts.read} finished ·{" "}
                  {data.statusCounts.reading} reading ·{" "}
                  {data.statusCounts.to_read} want to read
                </p>
              </div>
            </section>

            <section className="mt-12">
              <SectionHeading>Lists</SectionHeading>
              {data.lists.length === 0 ? (
                <p className="text-sm text-zinc-500">No public lists.</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {data.lists.map((l) => (
                    <li key={l.id} className={`${panelCls} p-4`}>
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                        <FiList className="h-4 w-4 text-zinc-500" /> {l.name}
                      </div>
                      {l.description && (
                        <p className="mt-1 text-sm text-zinc-400">
                          {l.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-zinc-500">
                        {l.book_count} book{l.book_count === 1 ? "" : "s"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-12">
              <SectionHeading>Reviews</SectionHeading>
              {data.reviews.length === 0 ? (
                <p className="text-sm text-zinc-500">No reviews yet.</p>
              ) : (
                <ul className="divide-y divide-zinc-800">
                  {data.reviews.map((r) => (
                    <li key={r.id} className="py-5">
                      <Link
                        href={`/books/${r.book_id}`}
                        className="font-serif text-lg font-semibold text-zinc-100 hover:underline"
                      >
                        {r.title}
                      </Link>
                      <p className="text-sm text-zinc-500">{r.author}</p>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">
                        {r.body}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
