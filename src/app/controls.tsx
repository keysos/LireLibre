"use client";

import { useEffect, useRef, useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiCheck, FiChevronDown } from "react-icons/fi";

/* ---------------------------------------------------------------- */
/* Star rating input                                                  */
/* ---------------------------------------------------------------- */

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function StarRating({
  value,
  onChange,
  onClear,
  size = "md",
  showLabel = true,
}: {
  value: number | null;
  onChange: (n: number) => void;
  onClear?: () => void;
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;
  const dim = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div className="inline-flex items-center gap-3">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHover(null)}
        role="radiogroup"
        aria-label="Rating"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(null)}
            onClick={() => (value === n && onClear ? onClear() : onChange(n))}
            className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
          >
            <FaStar
              className={`${dim} transition-colors ${n <= shown ? "text-amber-400" : "text-zinc-700"}`}
            />
          </button>
        ))}
      </div>
      {showLabel && (
        <span className="min-w-[4.5rem] text-xs text-zinc-500">
          {shown ? RATING_LABELS[shown] : "Not rated"}
        </span>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Popover plumbing shared by Select and Menu                         */
/* ---------------------------------------------------------------- */

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, ref };
}

const popoverCls =
  "absolute z-30 mt-1.5 min-w-full overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 py-1 shadow-xl shadow-black/50";
const itemCls =
  "flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100";

/* ---------------------------------------------------------------- */
/* Select (value picker)                                              */
/* ---------------------------------------------------------------- */

export type Option = { value: string; label: string };

export function Select({
  value,
  options,
  placeholder = "Select...",
  onChange,
  className = "",
}: {
  value: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const { open, setOpen, ref } = usePopover();
  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
      >
        <span className={current ? "" : "text-zinc-500"}>
          {current?.label ?? placeholder}
        </span>
        <FiChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul role="listbox" className={popoverCls}>
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={itemCls}
              >
                <span className="flex-1">{o.label}</span>
                {o.value === value && (
                  <FiCheck className="h-4 w-4 text-zinc-100" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Menu (action list behind a trigger)                                */
/* ---------------------------------------------------------------- */

export type MenuItem = {
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  danger?: boolean;
};

export function Menu({
  trigger,
  items,
  align = "left",
  triggerClassName,
  label,
}: {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
  triggerClassName?: string;
  label?: string;
}) {
  const { open, setOpen, ref } = usePopover();

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(!open)}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={`${popoverCls} min-w-[11rem] ${align === "right" ? "right-0" : "left-0"}`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={`${itemCls} ${item.danger ? "!text-red-400 hover:!bg-red-500/10" : ""}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Segmented control                                                  */
/* ---------------------------------------------------------------- */

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | "";
  options: { value: T; label: string; icon?: React.ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="inline-flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5"
      role="radiogroup"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
            value === o.value
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-400 hover:text-zinc-100"
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Toggle switch                                                      */
/* ---------------------------------------------------------------- */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-2.5 text-sm text-zinc-300 focus-visible:outline-none"
    >
      <span
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors group-focus-visible:ring-2 group-focus-visible:ring-zinc-500 ${
          checked ? "bg-zinc-100" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
            checked ? "left-[18px] bg-zinc-900" : "left-0.5 bg-zinc-300"
          }`}
        />
      </span>
      {label}
    </button>
  );
}

/* ---------------------------------------------------------------- */
/* Cover image with a fallback if the remote image fails to load      */
/* ---------------------------------------------------------------- */

export function Cover({
  src,
  className = "",
}: {
  src: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const finalSrc = src && src !== failed ? src : "/book-placeholder.svg";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt=""
      loading="lazy"
      onError={() => setFailed(src)}
      className={`flex-shrink-0 rounded bg-zinc-800 object-cover shadow-md shadow-black/40 ring-1 ring-white/5 ${className}`}
    />
  );
}
