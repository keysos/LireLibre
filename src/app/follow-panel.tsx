"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, btnSecondary, Notice } from "./ui";
type Counts = {
  followers: number;
  following: number;
  isFollowing: boolean;
  isSelf: boolean;
};
type Entry = {
  follower_id?: string;
  following_id?: string;
  profile: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
};
export default function FollowPanel({ userId }: { userId: string }) {
  return <FollowPanelContent key={userId} userId={userId} />;
}
function FollowPanelContent({ userId }: { userId: string }) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loggedOut, setLoggedOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [kind, setKind] = useState<"followers" | "following" | null>(null);
  const [page, setPage] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    fetch(`/api/users/${userId}/follows`)
      .then(async (r) => {
        if (!active) return;
        if (r.status === 401) {
          setLoggedOut(true);
          return;
        }
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (active) setCounts(d);
      })
      .catch((e) => {
        if (active) setError(e.message ?? "Unable to load followers");
      });
    return () => {
      active = false;
    };
  }, [userId]);
  useEffect(() => {
    if (!kind) return;
    let active = true;
    fetch(`/api/users/${userId}/follows?kind=${kind}&page=${page}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (active) {
          setEntries(d.items);
          setTotal(d.total);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [kind, page, userId]);
  async function toggle() {
    if (!counts) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/users/${userId}/follows`, {
        method: counts.isFollowing ? "DELETE" : "POST",
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const response = await fetch(`/api/users/${userId}/follows`);
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.error);
      setCounts(updated);
      setKind(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update follow");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mt-6 space-y-3" aria-label="Followers and following">
      {loggedOut ? (
        <Link href="/login" className="text-sm text-zinc-400 underline">
          Log in to follow readers and view followers.
        </Link>
      ) : counts ? (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <button
              disabled={kind === "followers" && page === 0}
              onClick={() => {
                setLoading(true);
                setEntries([]);
                setKind("followers");
                setPage(0);
              }}
              className="text-sm text-zinc-300 hover:underline"
            >
              {counts.followers} followers
            </button>
            <button
              disabled={kind === "following" && page === 0}
              onClick={() => {
                setLoading(true);
                setEntries([]);
                setKind("following");
                setPage(0);
              }}
              className="text-sm text-zinc-300 hover:underline"
            >
              {counts.following} following
            </button>
            {!counts.isSelf && (
              <button onClick={toggle} disabled={busy} className={btnSecondary}>
                {busy
                  ? "Saving..."
                  : counts.isFollowing
                    ? "Unfollow"
                    : "Follow"}
              </button>
            )}
          </div>
          {kind && (
            <div className="rounded-lg border border-zinc-800 p-4">
              <div className="mb-3 flex justify-between">
                <h2 className="text-sm font-semibold capitalize">{kind}</h2>
                <button
                  onClick={() => setKind(null)}
                  className="text-xs text-zinc-400"
                >
                  Close
                </button>
              </div>
              {loading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
              ) : entries.length === 0 ? (
                <p className="text-sm text-zinc-500">No readers yet.</p>
              ) : (
                <ul className="space-y-3">
                  {entries.map((e) => (
                    <li key={e.follower_id ?? e.following_id}>
                      {e.profile ? (
                        <Link
                          href={`/u/${e.profile.id}`}
                          className="flex items-center gap-2 text-sm text-zinc-300"
                        >
                          <Avatar
                            src={e.profile.avatar_url}
                            className="h-8 w-8"
                          />
                          {e.profile.name ?? "Reader"}
                        </Link>
                      ) : (
                        <Link
                          href={`/u/${e.follower_id ?? e.following_id}`}
                          className="text-sm text-zinc-500"
                        >
                          Private profile
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex gap-3 text-xs text-zinc-400">
                <button
                  disabled={loading || page === 0}
                  onClick={() => {
                    setLoading(true);
                    setPage((v) => v - 1);
                  }}
                >
                  Previous
                </button>
                <span>Page {page + 1}</span>
                <button
                  disabled={loading || (page + 1) * 20 >= total}
                  onClick={() => {
                    setLoading(true);
                    setPage((v) => v + 1);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : !error ? (
        <p className="text-xs text-zinc-500">Loading followers...</p>
      ) : null}
      {error && <Notice tone="error">{error}</Notice>}
    </section>
  );
}
