import Link from "next/link";
import { prisma } from "@/lib/db";
import { Section, Eyebrow, LinkButton, Badge, Card } from "@/components/ui";
import VenueCard from "@/components/VenueCard";
import { CATEGORIES, aed } from "@/lib/constants";

export default async function LandingPage() {
  const [venues, plans, partnerCount, journal] = await Promise.all([
    prisma.venue.findMany({
      where: { approved: true, spotlight: true },
      include: { services: { orderBy: { creditCost: "asc" }, take: 1 } },
      take: 3,
    }),
    prisma.plan.findMany({ orderBy: { order: "asc" } }),
    prisma.venue.count({ where: { approved: true } }),
    prisma.journalPost.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  return (
    <div>
      {/* Hero */}
      <Section className="pt-16 pb-12 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="fade-up">
            <Eyebrow>Licensed to Glow · Dubai</Eyebrow>
            <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-espresso sm:text-6xl">
              One membership for your whole beauty life.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-espresso-soft">
              Discover and book the salons, spas, clinics and nail studios worth
              returning to. Curated, included in your plan, and rewarding every month.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/signup" size="lg">
                Start your membership
              </LinkButton>
              <LinkButton href="/partners" variant="outline" size="lg">
                Browse venues
              </LinkButton>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-espresso-soft">
              <span>
                <strong className="text-espresso">{partnerCount}+</strong> curated venues
              </span>
              <span>
                <strong className="text-espresso">7</strong> treatment categories
              </span>
              <span>
                <strong className="text-espresso">4.8★</strong> average rating
              </span>
            </div>
          </div>

          <div className="fade-up relative">
            <div className="overflow-hidden rounded-[2rem] border border-line shadow-[0_30px_80px_-30px_rgba(43,33,24,0.45)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/1633681926022-84c23e8cb2d6.jpg"
                alt="A calm treatment room"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <Card className="absolute -bottom-6 -left-6 hidden w-56 p-4 shadow-lg sm:block">
              <p className="text-xs text-espresso-soft">Saved this month</p>
              <p className="font-serif text-2xl text-espresso">{aed(1240)}</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-cream">
                <div className="h-full w-3/4 rounded-full bg-champagne" />
              </div>
              <p className="mt-2 text-xs text-sage">Your glow streak is 4 weeks strong</p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Categories */}
      <Section className="py-12">
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/services/${c.key.toLowerCase()}`}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-sm text-espresso transition hover:border-champagne hover:bg-cream"
            >
              {c.emoji} {c.label}
            </Link>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section className="py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Choose your plan", d: "Pick a monthly membership with credits to spend across every partner venue." },
            { n: "02", t: "Discover & book", d: "Search by treatment, map or mood. Book included slots in a couple of taps." },
            { n: "03", t: "Track your glow", d: "Watch your saved value grow, build streaks and unlock member tiers." },
          ].map((s) => (
            <Card key={s.n} className="p-7">
              <span className="font-serif text-3xl text-champagne">{s.n}</span>
              <h3 className="mt-4 font-serif text-xl text-espresso">{s.t}</h3>
              <p className="mt-2 text-sm text-espresso-soft">{s.d}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Featured venues (Spotlight) */}
      <Section className="py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <Eyebrow>The Spotlight</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl text-espresso">Venues worth returning to</h2>
          </div>
          <Link href="/partners" className="text-sm text-champagne-deep hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((v) => (
            <VenueCard
              key={v.id}
              venue={{
                slug: v.slug,
                name: v.name,
                category: v.category,
                neighbourhood: v.neighbourhood,
                rating: v.rating,
                reviewCount: v.reviewCount,
                imageUrl: v.imageUrl,
                isNew: v.isNew,
                fromPrice: v.services[0]?.creditCost,
              }}
            />
          ))}
        </div>
      </Section>

      {/* Value / saved money band */}
      <Section className="py-12">
        <div className="overflow-hidden rounded-[2rem] bg-espresso px-8 py-14 text-cream sm:px-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <Eyebrow>Measurable value</Eyebrow>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-cream sm:text-4xl">
                See exactly what your membership is worth.
              </h2>
              <p className="mt-4 max-w-md text-cream/70">
                Every visit, your saved-money dashboard shows the retail value
                you&apos;ve unlocked, your monthly streak and your progress toward the
                next tier. No coupons. Just glow.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { k: "Retail value used", v: aed(1640) },
                { k: "You saved", v: aed(1240) },
                { k: "Visits this month", v: "3" },
                { k: "Glow streak", v: "4 weeks" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                  <p className="text-xs text-cream/60">{s.k}</p>
                  <p className="mt-1 font-serif text-2xl text-champagne">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Plans preview */}
      <Section className="py-12">
        <div className="mb-8 text-center">
          <Eyebrow>Membership</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl text-espresso">Choose how you glow</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <Card key={p.id} className={`p-7 ${i === 1 ? "ring-2 ring-champagne" : ""}`}>
              {i === 1 && <Badge tone="gold" className="mb-3">Most popular</Badge>}
              <h3 className="font-serif text-2xl text-espresso">{p.name}</h3>
              <p className="mt-2 text-sm text-espresso-soft">{p.description}</p>
              <p className="mt-5 font-serif text-3xl text-espresso">
                {aed(p.priceMonthly)}
                <span className="text-sm font-sans text-espresso-soft"> / month</span>
              </p>
              <p className="mt-1 text-sm text-champagne-deep">
                {p.creditsPerMonth} credits / month
              </p>
              <LinkButton
                href="/pricing"
                variant={i === 1 ? "primary" : "outline"}
                className="mt-6 w-full"
              >
                See plan
              </LinkButton>
            </Card>
          ))}
        </div>
      </Section>

      {/* Journal */}
      <Section className="py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <Eyebrow>The Edit</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl text-espresso">From the Glow Journal</h2>
          </div>
          <Link href="/journal" className="text-sm text-champagne-deep hover:underline">
            Read more →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {journal.map((j) => (
            <Link
              key={j.id}
              href={`/journal/${j.slug}`}
              className="group overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-white"
            >
              <div className="aspect-[16/10] overflow-hidden bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={j.imageUrl} alt={j.title} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <div className="p-5">
                <Badge tone="sage">{j.category}</Badge>
                <h3 className="mt-3 font-serif text-lg text-espresso">{j.title}</h3>
                <p className="mt-2 text-sm text-espresso-soft">{j.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="py-16">
        <div className="rounded-[2rem] border border-line bg-cream px-8 py-16 text-center">
          <h2 className="font-serif text-4xl text-espresso">Your beauty life, organised beautifully.</h2>
          <p className="mx-auto mt-4 max-w-lg text-espresso-soft">
            Join Licensed to Glow and turn scattered appointments into one calm,
            rewarding membership.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <LinkButton href="/signup" size="lg">Start your membership</LinkButton>
            <LinkButton href="/for-business" variant="outline" size="lg">List your venue</LinkButton>
          </div>
        </div>
      </Section>
    </div>
  );
}
