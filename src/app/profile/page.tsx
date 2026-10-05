"use client";
import { clientFetch } from "@/lib/client-fetch";
import FollowPanel from "../follow-panel";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiEdit2,
  FiExternalLink,
  FiTrash2,
  FiLock,
  FiGlobe,
} from "react-icons/fi";
import Nav from "../nav";
import {
  Avatar,
  displayName,
  ProgressBar,
  SectionHeading,
  Stars,
  btnPrimary,
  btnSecondary,
  btnGhost,
  btnDanger,
  inputCls,
  textareaCls,
  panelCls,
} from "../ui";
import { Toggle } from "../controls";

type Profile = {
  user: {
    id: string;
    email: string;
    name: string | null;
    bio: string | null;
    avatar_url: string | null;
    is_public: boolean;
    created_at: string;
  };
  statusCounts: Record<string, number>;
  reviews: { id: number; body: string; book_id: number; title: string }[];
  ratings: { id: number; rating: number; book_id: number; title: string }[];
  lists: { id: number; name: string; is_public: boolean; book_count: number }[];
  stats: {
    books_this_year: number;
    pages_read: number;
    average_rating_given: number | null;
  };
  goal: { year: number; target_books: number } | null;
};

const post = (url: string, body: object) =>
  clientFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export default function ProfilePage() {
  const router = useRouter();
  const [p, setP] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", avatarUrl: "" });
  const [goalInput, setGoalInput] = useState("");
  const [listName, setListName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  async function load() {
    const res = await clientFetch("/api/profile");
    if (res.status === 401) return router.push("/login");
    if (!res.ok)
      return setError((await res.json()).error ?? "Unable to load profile");
    setError(null);
    setP(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function patchProfile(body: object) {
    const res = await clientFetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Unable to save profile");
      return false;
    }
    await load();
    return true;
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (await patchProfile(form)) setEditing(false);
  }

  async function saveGoal(e: React.FormEvent) {
    e.preventDefault();
    const res = await post("/api/reading-goal", {
      targetBooks: Number(goalInput),
    });
    if (!res.ok)
      return setError((await res.json()).error ?? "Unable to save goal");
    setGoalInput("");
    load();
  }

  async function createList(e: React.FormEvent) {
    e.preventDefault();
    setListError(null);
    const res = await post("/api/lists", { name: listName });
    if (!res.ok)
      return setListError((await res.json()).error ?? "Could not create list");
    setListName("");
    load();
  }

  async function toggleList(id: number, isPublic: boolean) {
    await clientFetch(`/api/lists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic }),
    });
    load();
  }

  async function deleteList(id: number) {
    await clientFetch(`/api/lists/${id}`, { method: "DELETE" });
    load();
  }

  async function deleteReview(id: number) {
    await clientFetch(`/api/reviews/${id}`, { method: "DELETE" });
    load();
  }

  if (!p) {
    return (
      <div className="min-h-screen">
        <Nav />
        <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-zinc-500">
          {error ?? "Loading..."}
        </p>
      </div>
    );
  }

  const { user, statusCounts, reviews, ratings, lists, stats, goal } = p;
  const facts: [string, string | number][] = [
    ["Finished", statusCounts.read],
    ["Reading", statusCounts.reading],
    ["Want to read", statusCounts.to_read],
    ["Read this year", stats.books_this_year],
    ["Pages read", stats.pages_read.toLocaleString()],
    [
      "Average rating given",
      stats.average_rating_given
        ? stats.average_rating_given.toFixed(1)
        : "None yet",
    ],
  ];

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[300px_1fr]">
        {error && (
          <p role="alert" className="text-sm text-red-400 lg:col-span-2">
            {error}
          </p>
        )}
        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className={`${panelCls} p-5`}>
            <Avatar src={user.avatar_url} className="h-20 w-20" />
            {editing ? (
              <form onSubmit={saveProfile} className="mt-4 space-y-3">
                <input
                  className={inputCls}
                  maxLength={100}
                  placeholder="Display name (shown on your reviews)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <textarea
                  className={textareaCls}
                  maxLength={1000}
                  rows={4}
                  placeholder="Bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
                <input
                  className={inputCls}
                  maxLength={2048}
                  type="url"
                  placeholder="Profile picture URL (HTTPS)"
                  value={form.avatarUrl}
                  onChange={(e) =>
                    setForm({ ...form, avatarUrl: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <button className={btnPrimary}>Save</button>
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="mt-4 font-serif text-2xl font-semibold text-zinc-50">
                  {displayName(user.name)}
                </h1>
                <p className="text-sm text-zinc-500">{user.email}</p>
                {!user.name && (
                  <p className="mt-2 text-xs text-amber-400/90">
                    No display name yet. Your reviews appear as
                    &ldquo;Reader&rdquo; until you add one.
                  </p>
                )}
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  {user.bio ||
                    "Add a short bio so others know what you like to read."}
                </p>
                <p className="mt-3 text-xs text-zinc-500">
                  Member since{" "}
                  {new Date(user.created_at).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <button
                  className={`${btnSecondary} mt-4 w-full`}
                  onClick={() => {
                    setForm({
                      name: user.name ?? "",
                      bio: user.bio ?? "",
                      avatarUrl: user.avatar_url ?? "",
                    });
                    setEditing(true);
                  }}
                >
                  <FiEdit2 className="h-4 w-4" /> Edit profile
                </button>
              </>
            )}
          </div>

          <div className={`${panelCls} space-y-3 p-5`}>
            <Toggle
              checked={user.is_public}
              onChange={(v) => patchProfile({ isPublic: v })}
              label="Public profile"
            />
            <p className="text-xs leading-5 text-zinc-500">
              {user.is_public
                ? "Anyone can view your profile, public lists, and reviews."
                : "Only you can see your profile. Your reviews are hidden from the public feed."}
            </p>
            {user.is_public && (
              <Link
                href={`/u/${user.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-300 underline underline-offset-4 hover:text-white"
              >
                View public page <FiExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <dl className={`${panelCls} divide-y divide-zinc-800`}>
            {facts.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between px-5 py-3 text-sm"
              >
                <dt className="text-zinc-400">{label}</dt>
                <dd className="font-medium text-zinc-100">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>

        {/* Main */}
        <div className="space-y-12">
          <section>
            <SectionHeading>
              {new Date().getFullYear()} reading goal
            </SectionHeading>
            {goal && (
              <div className="mb-4">
                <div className="mb-2 flex items-baseline justify-between text-sm">
                  <span className="font-medium text-zinc-100">
                    {stats.books_this_year} of {goal.target_books} books
                  </span>
                  <span className="text-zinc-500">
                    {Math.min(
                      100,
                      Math.round(
                        (stats.books_this_year / goal.target_books) * 100,
                      ),
                    )}
                    %
                  </span>
                </div>
                <ProgressBar
                  value={stats.books_this_year}
                  max={goal.target_books}
                />
              </div>
            )}
            <form onSubmit={saveGoal} className="flex max-w-sm gap-2">
              <input
                type="number"
                min={1}
                required
                className={inputCls}
                placeholder="Books this year"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
              />
              <button className={btnSecondary + " h-10 flex-shrink-0"}>
                {goal ? "Update" : "Set goal"}
              </button>
            </form>
          </section>
          <FollowPanel userId={user.id} />

          <section>
            <SectionHeading>Lists</SectionHeading>
            <form onSubmit={createList} className="mb-4 flex max-w-sm gap-2">
              <input
                className={inputCls}
                placeholder="New list name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
              <button className={btnSecondary + " h-10 flex-shrink-0"}>
                Create
              </button>
            </form>
            {listError && (
              <p role="alert" className="mb-3 text-sm text-red-400">
                {listError}
              </p>
            )}
            {lists.length === 0 ? (
              <p className="text-sm text-zinc-500">
                You have not created any lists.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
                {lists.map((l) => (
                  <li
                    key={l.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {l.is_public ? (
                        <FiGlobe
                          className="h-4 w-4 text-zinc-500"
                          aria-label="Public"
                        />
                      ) : (
                        <FiLock
                          className="h-4 w-4 text-zinc-500"
                          aria-label="Private"
                        />
                      )}
                      <span className="text-sm font-medium text-zinc-100">
                        {l.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {l.book_count} book{l.book_count === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Toggle
                        checked={l.is_public}
                        onChange={(v) => toggleList(l.id, v)}
                        label="Public"
                      />
                      <button
                        className={`${btnDanger} h-8 px-2`}
                        aria-label={`Delete ${l.name}`}
                        onClick={() => deleteList(l.id)}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <SectionHeading>
              Ratings{" "}
              <span className="ml-1 font-normal text-zinc-500">
                {ratings.length}
              </span>
            </SectionHeading>
            {ratings.length === 0 ? (
              <p className="text-sm text-zinc-500">
                You have not rated any books.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {ratings.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <Link
                      href={`/books/${r.book_id}`}
                      className="truncate text-sm text-zinc-200 hover:underline"
                    >
                      {r.title}
                    </Link>
                    <Stars value={r.rating} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <SectionHeading>
              Reviews{" "}
              <span className="ml-1 font-normal text-zinc-500">
                {reviews.length}
              </span>
            </SectionHeading>
            {reviews.length === 0 ? (
              <p className="text-sm text-zinc-500">
                You have not written any reviews.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {reviews.map((r) => (
                  <li key={r.id} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/books/${r.book_id}`}
                        className="font-serif text-base font-semibold text-zinc-100 hover:underline"
                      >
                        {r.title}
                      </Link>
                      <button
                        className={`${btnDanger} h-8 px-2`}
                        aria-label="Delete review"
                        onClick={() => deleteReview(r.id)}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-zinc-400">
                      {r.body}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
