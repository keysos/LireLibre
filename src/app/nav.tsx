"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiMenu, FiX, FiUser, FiLogOut, FiExternalLink } from "react-icons/fi";
import { Logo, Avatar } from "./ui";
import { Menu } from "./controls";

type Me = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
};

const LINKS = [
  { href: "/books", label: "Library" },
  { href: "/search", label: "Discover" },
  { href: "/reviews", label: "Reviews" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const active = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/books">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active(l.href)
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Menu
              align="right"
              label="Account menu"
              triggerClassName="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
              trigger={
                <Avatar src={me?.avatar_url ?? null} className="h-8 w-8" />
              }
              items={[
                {
                  label: "Profile",
                  icon: <FiUser className="h-4 w-4" />,
                  onSelect: () => router.push("/profile"),
                },
                ...(me
                  ? [
                      {
                        label: "Public page",
                        icon: <FiExternalLink className="h-4 w-4" />,
                        onSelect: () => router.push(`/u/${me.id}`),
                      },
                    ]
                  : []),
                {
                  label: "Log out",
                  icon: <FiLogOut className="h-4 w-4" />,
                  onSelect: handleLogout,
                },
              ]}
            />
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 sm:hidden"
            aria-label="Toggle menu"
          >
            {open ? (
              <FiX className="h-5 w-5" />
            ) : (
              <FiMenu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-zinc-800 bg-zinc-950 px-4 py-2 sm:hidden">
          {[...LINKS, { href: "/profile", label: "Profile" }].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`rounded-md px-3 py-2.5 text-sm font-medium ${active(l.href) ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"}`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-zinc-400"
          >
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
