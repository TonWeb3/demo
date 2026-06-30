import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { CATEGORIES, categoryMeta, aed } from "@/lib/constants";
import { Stars, Badge } from "@/components/ui";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DiscoverPage() {
  const user = await requireUser();
  const goals: string[] = JSON.parse(user.goals || "[]");

  // Rules-based recommendation: categories from past bookings, fallback to spotlight.
  const past = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { service: true },
    orderBy: { date: "desc" },
    take: 5,
  });
  const seenCategories = [...new Set(past.map((b) => b.service.category))];

  const [recommended, spotlight, newest, journal] = await Promise.all([
    prisma.venue.findMany({
      where: {
        approved: true,
        ...(seenCategories.length ? { category: { in: seenCategories } } : { spotlight: true }),
      },
      include: { services: { orderBy: { creditCost: "asc" }, take: 1 } },
      take: 4,
    }),
    prisma.venue.findMany({
      where: { approved: true, spotlight: true },
      take: 6,
    }),
    prisma.venue.findMany({
      where: { approved: true, isNew: true },
      include: { services: { orderBy: { creditCost: "asc" }, take: 1 } },
      take: 4,
    }),
    prisma.journalPost.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  return (
    <div className="space-y-8 px-5 py-5">
      {/* Greeting */}
      <div>
        <p className="text-sm text-espresso-soft">{greeting()},</p>
        <h1 className="font-serif text-3xl text-espresso">{user.name.split(" ")[0]} ✦</h1>
        {goals.length > 0 && (
          <p className="mt-1 text-sm text-espresso-soft">
            Working toward {goals.slice(0, 2).join(" & ").toLowerCase()}
          </p>
        )}
      </div>

      {/* Search entry */}
      <Link
        href="/app/search"
        className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-sm text-espresso-soft"
      >
        <span className="text-lg">⌕</span> Search treatments, venues or areas…
      </Link>

      {/* Category chips */}
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={`/app/search?category=${c.key}`}
            className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-sm text-espresso"
          >
            {c.emoji} {c.label.split(" ")[0]}
          </Link>
        ))}
      </div>

      {/* Recommended */}
      <Section title="Recommended for you" subtitle={seenCategories.length ? "Because of your recent visits" : "Members' favourites"}>
        <div className="grid grid-cols-2 gap-3">
          {recommended.map((v) => (
            <MiniVenue key={v.id} v={v} credit={v.services?.[0]?.creditCost} />
          ))}
        </div>
      </Section>

      {/* Spotlight videos (Doc §7.4) */}
      <Section title="Spotlight" subtitle="Step inside before you book">
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {spotlight.map((v) => {
            const cat = categoryMeta(v.category);
            return (
              <Link
                key={v.id}
                href={`/app/venues/${v.slug}`}
                className="relative h-56 w-40 shrink-0 overflow-hidden rounded-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.imageUrl} alt={v.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 to-transparent" />
                <div className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-espresso">▶</div>
                <div className="absolute bottom-0 p-3 text-white">
                  <p className="text-[10px] opacity-80">{cat.emoji} {v.neighbourhood}</p>
                  <p className="font-serif text-sm leading-tight">{v.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* New venues */}
      {newest.length > 0 && (
        <Section title="New to the platform" subtitle="Fresh venues with launch offers">
          <div className="grid grid-cols-2 gap-3">
            {newest.map((v) => (
              <MiniVenue key={v.id} v={v} credit={v.services?.[0]?.creditCost} isNew />
            ))}
          </div>
        </Section>
      )}

      {/* The Edit / Highlights */}
      <Section title="The Edit" subtitle="Curated this week">
        <div className="space-y-3">
          {journal.map((j) => (
            <Link
              key={j.id}
              href={`/journal/${j.slug}`}
              className="flex items-center gap-3 overflow-hidden rounded-2xl border border-line bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={j.imageUrl} alt={j.title} className="h-20 w-24 shrink-0 object-cover" />
              <div className="py-2 pr-3">
                <Badge tone="sage">{j.category}</Badge>
                <p className="mt-1 font-serif text-sm leading-tight text-espresso">{j.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Passport teaser */}
      <Link
        href="/app/passport"
        className="block rounded-2xl bg-espresso p-5 text-cream"
      >
        <p className="text-xs text-cream/60">Gimmick · The Glow Passport</p>
        <p className="mt-1 font-serif text-xl">Collect a stamp with every visit →</p>
      </Link>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-serif text-xl text-espresso">{title}</h2>
        {subtitle && <p className="text-xs text-espresso-soft">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function MiniVenue({
  v,
  credit,
  isNew,
}: {
  v: { slug: string; name: string; neighbourhood: string; rating: number; imageUrl: string; category: string };
  credit?: number;
  isNew?: boolean;
}) {
  return (
    <Link href={`/app/venues/${v.slug}`} className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="relative aspect-square overflow-hidden bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={v.imageUrl} alt={v.name} className="h-full w-full object-cover" />
        {isNew && <Badge tone="new" className="absolute left-2 top-2">New</Badge>}
      </div>
      <div className="p-2.5">
        <p className="truncate font-medium text-espresso">{v.name}</p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-espresso-soft">
          <Stars rating={v.rating} className="text-[10px]" />
          <span>{v.rating.toFixed(1)}</span>
          <span>· {v.neighbourhood}</span>
        </div>
        {credit != null && (
          <p className="mt-1 text-[11px] text-champagne-deep">
            {credit} credit{credit === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </Link>
  );
}
