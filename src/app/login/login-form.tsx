"use client";
import { clientFetch } from "@/lib/client-fetch";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { btnPrimary, btnSecondary, inputCls, Notice } from "../ui";

export default function LoginForm({ notice }: { notice: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setResent(false);
    setLoading(true);

    const res = await clientFetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      if (data.code === "email_not_verified") setUnverified(true);
      else setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/books");
    router.refresh();
  }

  async function resend() {
    const res = await clientFetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok)
      return setError((await res.json()).error ?? "Unable to resend email");
    setResent(true);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {notice && <Notice tone="success">{notice}</Notice>}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-300"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-zinc-400 hover:text-zinc-100"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        {unverified && (
          <div className="space-y-3">
            <Notice tone="info">
              Please confirm your email address before logging in. We sent a
              link when you signed up.
            </Notice>
            {resent ? (
              <Notice tone="success">
                If that account is waiting for confirmation, a new email is on
                its way.
              </Notice>
            ) : (
              <button
                type="button"
                onClick={resend}
                className={`${btnSecondary} w-full`}
              >
                Resend confirmation email
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`${btnPrimary} h-10 w-full`}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-zinc-100 underline underline-offset-4 hover:text-white"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
