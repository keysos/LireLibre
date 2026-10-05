"use client";
import { clientFetch } from "@/lib/client-fetch";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { AuthShell, btnPrimary, inputCls, Notice } from "../ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await clientFetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok)
      return setError((await res.json()).error ?? "Could not send email");
    setSent(true);
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we will send you a link to choose a new password."
    >
      {sent ? (
        <Notice tone="success">
          If an account exists for <span className="font-medium">{email}</span>,
          a reset link is on its way. Use the most recent link before it
          expires.
        </Notice>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Notice tone="error">{error}</Notice>}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-300"
            >
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
          <button
            type="submit"
            disabled={loading}
            className={`${btnPrimary} h-10 w-full`}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100"
      >
        <FiArrowLeft className="h-4 w-4" /> Back to log in
      </Link>
    </AuthShell>
  );
}
