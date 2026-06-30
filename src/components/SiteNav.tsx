import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LinkButton } from "./ui";

const links = [
  { href: "/partners", label: "Venues" },
  { href: "/services/skin", label: "Treatments" },
  { href: "/pricing", label: "Membership" },
  { href: "/journal", label: "Glow Journal" },
  { href: "/for-business", label: "For business" },
];

export default async function SiteNav() {
  const session = await getSession();
  const appHref =
    session?.role === "ADMIN" ? "/admin" : session?.role === "PARTNER" ? "/partner" : "/app";

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-porcelain/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-serif text-xl tracking-tight text-espresso">
          Licensed to Glow
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-espresso-soft transition hover:text-espresso"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <LinkButton href={appHref} size="sm">
              Open app
            </LinkButton>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden px-3 text-sm text-espresso-soft transition hover:text-espresso sm:block"
              >
                Sign in
              </Link>
              <LinkButton href="/signup" size="sm">
                Join now
              </LinkButton>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
