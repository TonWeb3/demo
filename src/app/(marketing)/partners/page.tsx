import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Section, Eyebrow } from "@/components/ui";
import VenueCard from "@/components/VenueCard";
import { CATEGORIES, AREAS, categoryMeta } from "@/lib/constants";
import { clsx } from "clsx";

export const metadata: Metadata = {
  title: "Partner venues directory",
  description:
    "Browse curated salons, spas, clinics, nail studios and grooming houses across Dubai. Filter by category and neighbourhood.",
};

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; area?: string }>;
}) {
  const { category, area } = await searchParams;

  const venues = await prisma.venue.findMany({
    where: {
      approved: true,
      ...(category ? { category: category.toUpperCase() } : {}),
      ...(area ? { neighbourhood: area } : {}),
    },
    include: { services: { orderBy: { creditCost: "asc" }, take: 1 } },
    orderBy: [{ spotlight: "desc" }, { rating: "desc" }],
  });

  return (
    <div>
      <Section className="py-14">
        <Eyebrow>The directory</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl text-espresso sm:text-5xl">
          {category ? `${categoryMeta(category.toUpperCase()).label}` : "Every venue worth returning to"}
        </h1>
        <p className="mt-3 max-w-xl text-espresso-soft">
          {venues.length} curated {venues.length === 1 ? "venue" : "venues"} in Dubai.
          Each one is vetted for cleanliness, quality and that calm premium feel.
        </p>

        {/* Category filter */}
        <div className="mt-8 flex flex-wrap gap-2">
          <FilterChip href="/partners" active={!category}>
            All
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.key}
              href={`/partners?category=${c.key.toLowerCase()}`}
              active={category?.toUpperCase() === c.key}
            >
              {c.emoji} {c.label}
            </FilterChip>
          ))}
        </div>

        {/* Area filter */}
        <div className="mt-3 flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <FilterChip
              key={a}
              href={`/partners?${new URLSearchParams({ ...(category ? { category } : {}), area: a }).toString()}`}
              active={area === a}
              small
            >
              {a}
            </FilterChip>
          ))}
        </div>
      </Section>

      <Section className="pb-20">
        {venues.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white p-10 text-center text-espresso-soft">
            No venues match that filter yet.{" "}
            <Link href="/partners" className="text-champagne-deep underline">
              Clear filters
            </Link>
          </p>
        ) : (
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
        )}
      </Section>
    </div>
  );
}

function FilterChip({
  href,
  active,
  small,
  children,
}: {
  href: string;
  active?: boolean;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "rounded-full border transition",
        small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        active
          ? "border-champagne bg-champagne/20 text-champagne-deep"
          : "border-line bg-white text-espresso-soft hover:border-champagne",
      )}
    >
      {children}
    </Link>
  );
}
