"use client";
import { clientFetch } from "@/lib/client-fetch";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { btnPrimary, btnSecondary, inputCls, Notice } from "../ui";

export default function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm)
      return setError("The two passwords do not match.");

    setLoading(true);
    const res = await clientFetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);

    if (res.ok) return router.push("/login?reset=1");

    const data = await res.json();
    // A password problem can be fixed on this page; a dead link cannot.
    if (data.error?.includes("link")) setExpired(true);
    else setError(data.error ?? "Something went wrong");
  }

  if (expired) {
    return (
      <div className="space-y-4">
        <Notice tone="error">
          This reset link is invalid or has expired. Links can only be used once
          and last one hour.
        </Notice>
        <Link href="/forgot-password" className={`${btnSecondary} w-full`}>
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-300">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirm" className="text-sm font-medium text-zinc-300">
          Confirm new password
        </label>
        <input
          id="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputCls}
        />
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <button
        type="submit"
        disabled={loading}
        className={`${btnPrimary} h-10 w-full`}
      >
        {loading ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}
