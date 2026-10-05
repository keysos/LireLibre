// Server-safe building blocks and shared class strings. Interactive pieces
// (star input, menus, toggles) live in controls.tsx.
import { FiBookOpen } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import Link from "next/link";

export const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500";
export const btnPrimary = `${btnBase} h-9 bg-zinc-100 px-3.5 text-zinc-900 hover:bg-white`;
export const btnSecondary = `${btnBase} h-9 border border-zinc-800 bg-zinc-900 px-3.5 text-zinc-200 hover:bg-zinc-800`;
export const btnGhost = `${btnBase} h-9 px-3 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100`;
export const btnDanger = `${btnBase} h-9 px-3 text-red-400 hover:bg-red-500/10`;
export const inputCls =
  "h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 transition-colors hover:border-zinc-700 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700/50";
export const textareaCls = inputCls.replace("h-10 ", "py-2 ");
export const panelCls = "rounded-lg border border-zinc-800 bg-zinc-900/40";
export const labelCls =
  "text-xs font-medium uppercase tracking-wider text-zinc-500";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex items-center gap-2 font-serif text-lg font-semibold tracking-tight text-zinc-100 ${className}`}
    >
      <FiBookOpen className="h-[18px] w-[18px]" aria-hidden />
      LireLibre
    </span>
  );
}

export function Stars({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) =>
        n <= value ? (
          <FaStar key={n} className="h-3 w-3 text-amber-400" />
        ) : (
          <FaRegStar key={n} className="h-3 w-3 text-zinc-700" />
        ),
      )}
    </span>
  );
}

export function ProgressBar({
  value,
  max = 100,
  className = "",
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className={`h-1 overflow-hidden rounded-full bg-zinc-800 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-zinc-200 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Cover } from "./controls";

export function Avatar({
  src,
  className = "h-8 w-8",
}: {
  src: string | null;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || "/avatar-placeholder.svg"}
      alt=""
      className={`flex-shrink-0 rounded-full object-cover ring-1 ring-white/10 ${className}`}
    />
  );
}

export function SectionHeading({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
      <h2 className="text-sm font-semibold text-zinc-100">{children}</h2>
      {action}
    </div>
  );
}

/** Public display name. Never falls back to the email address. */
export const displayName = (name?: string | null) => name?.trim() || "Reader";

/** Shared frame for the sign-in, sign-up and password pages. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 py-5 sm:px-6">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-24 pt-8 sm:items-center sm:pt-0">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-50">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: React.ReactNode;
}) {
  const tones = {
    info: "border-zinc-700 bg-zinc-800/50 text-zinc-300",
    error: "border-red-500/20 bg-red-500/10 text-red-300",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  };
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-md border px-3 py-2.5 text-sm leading-6 ${tones[tone]}`}
    >
      {children}
    </p>
  );
}
