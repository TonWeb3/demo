import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Section, Badge, Stars, LinkButton, Eyebrow } from "@/components/ui";
import { categoryMeta, aed } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const venue = await prisma.venue.findUnique({ where: { slug } });
  if (!venue) return { title: "Venue" };
  return {
    title: `${venue.name} — ${venue.neighbourhood}`,
    description: venue.description,
  };
}

export default async function VenuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = await prisma.venue.findUnique({
    where: { slug },
    include: {
      services: { orderBy: { creditCost: "asc" } },
      reviews: {
        include: { user: true, service: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
    },
  });
  if (!venue || !venue.approved) notFound();

  const cat = categoryMeta(venue.category);
  const amenities: string[] = JSON.parse(venue.amenities);
  const gallery: string[] = JSON.parse(venue.gallery || "[]");

  return (
    <div>
      {/* Hero image */}
      <div className="relative h-[42vh] min-h-72 w-full overflow-hidden bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={venue.imageUrl} alt={venue.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <Section className="pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="dark">{cat.emoji} {cat.label}</Badge>
              {venue.isNew && <Badge tone="new">New to the platform</Badge>}
              {venue.spotlight && <Badge tone="gold">Spotlight</Badge>}
            </div>
            <h1 className="mt-3 font-serif text-4xl text-white sm:text-5xl">{venue.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-white/90">
              <Stars rating={venue.rating} />
              <span>{venue.rating.toFixed(1)}</span>
              <span className="text-white/70">({venue.reviewCount} reviews)</span>
              <span className="text-white/70">· {venue.neighbourhood}</span>
            </div>
          </Section>
        </div>
      </div>

      <Section className="grid gap-12 py-12 lg:grid-cols-[1.6fr_1fr]">
        {/* Main */}
        <div>
          <p className="text-lg text-espresso-soft">{venue.description}</p>
          <p className="mt-3 text-sm text-espresso-soft">📍 {venue.address}</p>

          {/* Amenities */}
          <div className="mt-6 flex flex-wrap gap-2">
            {amenities.map((a) => (
              <Badge key={a} tone="default">{a}</Badge>
            ))}
          </div>

          {/* Gallery */}
          {gallery.length > 1 && (
            <div className="mt-8">
              <h2 className="mb-3 font-serif text-2xl text-espresso">Gallery</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {gallery.map((src, i) => (
                  <div key={src} className={`overflow-hidden rounded-xl bg-cream ${i === 0 ? "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${venue.name} ${i + 1}`} className={`w-full object-cover ${i === 0 ? "aspect-square sm:aspect-[4/3]" : "aspect-square"}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          <h2 className="mt-12 font-serif text-2xl text-espresso">Treatments</h2>
          <div className="mt-5 space-y-3">
            {venue.services.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-4">
                  {s.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={s.imageUrl} alt={s.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-espresso">{s.name}</h3>
                      {s.includedInPlan && <Badge tone="sage">Included</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-espresso-soft">{s.description}</p>
                    <p className="mt-2 text-xs text-espresso-soft">
                      {s.durationMin} min · {s.therapistLevel} therapist · retail {aed(s.retailPrice)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span className="text-sm font-medium text-champagne-deep">
                    {s.creditCost} credit{s.creditCost === 1 ? "" : "s"}
                  </span>
                  <LinkButton href={`/app/book/${s.id}`} size="sm">
                    Book
                  </LinkButton>
                </div>
              </div>
            ))}
          </div>

          {/* Reviews */}
          <h2 className="mt-12 font-serif text-2xl text-espresso">Member reviews</h2>
          <p className="mt-1 text-sm text-espresso-soft">
            Verified — only members who attended can review.
          </p>
          <div className="mt-5 space-y-4">
            {venue.reviews.length === 0 && (
              <p className="text-sm text-espresso-soft">No reviews yet.</p>
            )}
            {venue.reviews.map((r) => {
              const tags: string[] = JSON.parse(r.tags);
              return (
                <div key={r.id} className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-espresso">{r.user.name}</p>
                    <Stars rating={r.rating} />
                  </div>
                  <p className="mt-1 text-xs text-espresso-soft">{r.service.name}</p>
                  {r.notes && <p className="mt-3 text-sm text-espresso-soft">“{r.notes}”</p>}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <Badge key={t} tone="default">{t}</Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--radius-xl2)] border border-line bg-cream p-6">
            <Eyebrow>Members save more</Eyebrow>
            <p className="mt-3 font-serif text-2xl text-espresso">
              Included in your membership
            </p>
            <p className="mt-2 text-sm text-espresso-soft">
              Book this venue with your monthly credits — no per-visit retail prices.
            </p>
            <LinkButton href="/signup" className="mt-5 w-full" size="lg">
              Start membership
            </LinkButton>
            <p className="mt-3 text-center text-xs text-espresso-soft">
              Already a member?{" "}
              <Link href="/app" className="text-champagne-deep underline">
                Open the app
              </Link>
            </p>
          </div>

          {/* Map placeholder (keyless) */}
          <div className="mt-4 overflow-hidden rounded-[var(--radius-xl2)] border border-line">
            <div className="relative h-44 bg-sage/15">
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <span className="text-3xl">📍</span>
                  <p className="mt-1 text-sm text-espresso">{venue.neighbourhood}</p>
                  <p className="text-xs text-espresso-soft">{venue.address}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </Section>
    </div>
  );
}
