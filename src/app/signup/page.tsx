"use client";
import { clientFetch } from "@/lib/client-fetch";

import { useState } from "react";
import Link from "next/link";
import { FiMail } from "react-icons/fi";
import { AuthShell, btnPrimary, btnSecondary, inputCls, Notice } from "../ui";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ emailSent: boolean } | null>(null);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await clientFetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);

    const data = await res.json();
    if (!res.ok) return setError(data.error ?? "Something went wrong");
    setDone({ emailSent: data.emailSent !== false });
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

  if (done) {
    return (
      <AuthShell title="Check your email">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300">
          <FiMail className="h-5 w-5" />
        </div>
        <p className="mt-5 text-sm leading-6 text-zinc-400">
          {done.emailSent ? (
            <>
              We sent a confirmation link to{" "}
              <span className="font-medium text-zinc-200">{email}</span>. Open
              it to activate your account. Use the most recent link before it
              expires.
            </>
          ) : (
            <>
              Your account was created, but we could not send the confirmation
              email to{" "}
              <span className="font-medium text-zinc-200">{email}</span>. Use
              the button below to try again.
            </>
          )}
        </p>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="mt-6 space-y-3">
          {resent ? (
            <Notice tone="success">
              A new confirmation email is on its way.
            </Notice>
          ) : (
            <button onClick={resend} className={`${btnSecondary} w-full`}>
              Resend confirmation email
            </button>
          )}
          <Link href="/login" className={`${btnPrimary} h-10 w-full`}>
            Go to log in
          </Link>
        </div>
        <p className="mt-6 text-xs leading-5 text-zinc-500">
          Cannot find it? Check your spam folder.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking your reading."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-zinc-300">
            Display name
          </label>
          <input
            id="name"
            type="text"
            required
            maxLength={60}
            autoComplete="nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
          <p className="text-xs text-zinc-500">
            Shown on your reviews and public profile.
          </p>
        </div>

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
          <p className="text-xs text-zinc-500">Never shown to other readers.</p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-zinc-300"
          >
            Password
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
          <p className="text-xs text-zinc-500">At least 8 characters.</p>
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        <button
          type="submit"
          disabled={loading}
          className={`${btnPrimary} h-10 w-full`}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-100 underline underline-offset-4 hover:text-white"
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
