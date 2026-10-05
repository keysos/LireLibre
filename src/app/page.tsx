import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { searchBooks } from "@/lib/openlibrary";
import {
  Logo,
  Stars,
  ProgressBar,
  Cover,
  btnPrimary,
  btnSecondary,
  panelCls,
} from "./ui";
import {
  FiSearch,
  FiBookOpen,
  FiStar,
  FiList,
  FiTarget,
  FiLock,
  FiArrowRight,
} from "react-icons/fi";

const FEATURES = [
  {
    icon: FiSearch,
    title: "Catalog search",
    body: "Find any edition through Open Library, with covers, authors and descriptions filled in for you.",
  },
  {
    icon: FiBookOpen,
    title: "Shelves and progress",
    body: "Keep Want to Read, Currently Reading and Finished shelves, and log the page you are on.",
  },
  {
    icon: FiStar,
    title: "Ratings and reviews",
    body: "Rate on a five-point scale and write reviews you can edit at any time.",
  },
  {
    icon: FiList,
    title: "Custom lists",
    body: "Group books into your own lists and decide which ones are visible to others.",
  },
  {
    icon: FiTarget,
    title: "Annual goal",
    body: "Set a yearly target and follow your progress as you finish books.",
  },
  {
    icon: FiLock,
    title: "Privacy controls",
    body: "Your profile and each list are private or public, entirely at your discretion.",
  },
];

// Example books for the preview panel. Covers are looked up from Open Library
// (cached for a day); if that fails, the ISBN cover URL is tried, and if that
// fails too the Cover component shows a neutral placeholder.
const PREVIEW = [
  {
    title: "The Left Hand of Darkness",
    author: "Ursula K. Le Guin",
    page: 187,
    total: 304,
    isbn: "9780441478125",
  },
  {
    title: "Middlemarch",
    author: "George Eliot",
    page: 512,
    total: 880,
    isbn: "9780141439549",
  },
];

async function previewCover(book: (typeof PREVIEW)[number]) {
  const [match] = await searchBooks(`${book.title} ${book.author}`, 1, {
    revalidate: 86400,
  }).catch(() => []);
  return (
    match?.coverUrl ??
    `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
  );
}

export default async function Home() {
  const userId = await getCurrentUserId();
  if (userId) redirect("/books");

  const covers = await Promise.all(PREVIEW.map(previewCover));

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link
              href="/reviews"
              className="hidden rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 sm:block"
            >
              Reviews
            </Link>
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100"
            >
              Log in
            </Link>
            <Link href="/signup" className={btnPrimary}>
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500">
              Reading tracker
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-50 sm:text-5xl">
              A quieter way to keep track of what you read.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-400">
              Build a personal library from the Open Library catalog, log your
              progress, rate and review what you finish, and work toward a
              yearly reading goal.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className={`${btnPrimary} h-11 px-5`}>
                Create an account <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/reviews" className={`${btnSecondary} h-11 px-5`}>
                Read public reviews
              </Link>
            </div>
          </div>

          {/* Static preview of the library view */}
          <div
            className={`${panelCls} p-5 shadow-2xl shadow-black/40`}
            aria-hidden
          >
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-sm font-semibold text-zinc-100">
                Currently reading
              </span>
              <span className="text-xs text-zinc-500">2 books</span>
            </div>
            <ul className="divide-y divide-zinc-800">
              {PREVIEW.map((b, i) => (
                <li
                  key={b.title}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <Cover src={covers[i]} className="h-[84px] w-14" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {b.title}
                    </p>
                    <p className="text-xs text-zinc-500">{b.author}</p>
                    <ProgressBar
                      value={b.page}
                      max={b.total}
                      className="mt-3"
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Page {b.page} of {b.total}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
              <div>
                <p className="text-xs text-zinc-500">2026 goal</p>
                <p className="text-sm font-medium text-zinc-100">
                  9 of 24 books
                </p>
              </div>
              <Stars value={4} />
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-800/70">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-serif text-2xl font-semibold text-zinc-50">
              Everything in one place
            </h2>
            <dl className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title}>
                  <f.icon className="h-5 w-5 text-zinc-400" aria-hidden />
                  <dt className="mt-3 text-sm font-semibold text-zinc-100">
                    {f.title}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                    {f.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800/70 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-xs text-zinc-500 sm:flex-row sm:justify-between sm:px-6">
          <span>LireLibre</span>
          <span>Book data provided by Open Library.</span>
        </div>
      </footer>
    </div>
  );
}
