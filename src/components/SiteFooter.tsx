import Link from "next/link";

const cols = [
  {
    title: "Discover",
    links: [
      { href: "/partners", label: "All venues" },
      { href: "/services/skin", label: "Facials & skin" },
      { href: "/services/hair", label: "Hair" },
      { href: "/services/nails", label: "Nails" },
      { href: "/services/body", label: "Massage & body" },
    ],
  },
  {
    title: "Membership",
    links: [
      { href: "/pricing", label: "Plans & pricing" },
      { href: "/journal", label: "Glow Journal" },
      { href: "/signup", label: "Join now" },
      { href: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Business",
    links: [
      { href: "/for-business", label: "Partner with us" },
      { href: "/corporate", label: "Corporate wellness" },
      { href: "/partner", label: "Partner portal" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-serif text-xl text-espresso">Licensed to Glow</p>
          <p className="mt-3 max-w-xs text-sm text-espresso-soft">
            One membership for the salons, spas and clinics worth returning to.
            Curated, bookable and rewarding.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-espresso">
              {c.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-espresso-soft transition hover:text-champagne-deep"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-espresso-soft sm:flex-row sm:px-8">
          <p>© {2026} Licensed to Glow. A curated beauty membership · Dubai.</p>
          <p>Curated access · Easy booking · Measurable value</p>
        </div>
      </div>
    </footer>
  );
}
