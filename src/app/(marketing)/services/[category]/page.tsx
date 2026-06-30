import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Section, LinkButton } from "@/components/ui";
import VenueCard from "@/components/VenueCard";
import { CATEGORIES, categoryMeta, CATEGORY_HERO } from "@/lib/constants";

// Pre-render every category page for SEO (Doc §9 service SEO pages)
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.key.toLowerCase() }));
}

const COPY: Record<string, { h1: string; intro: string }> = {
  SKIN: { h1: "Facials & skin treatments in Dubai", intro: "From express lunchtime glows to medical-grade resurfacing — book the city's best facialists, all included in your membership." },
  HAIR: { h1: "Hair salons in Dubai", intro: "Lived-in colour, glossy blowouts and precision cuts from editorial hair houses worth returning to." },
  NAILS: { h1: "Nail studios in Dubai", intro: "Spotless, modern nail studios for express gel manicures and restorative pedicures." },
  BODY: { h1: "Massage & body treatments in Dubai", intro: "Deep-tissue recovery and de-stress massage from recovery-focused spas." },
  WELLNESS: { h1: "Wellness & recovery in Dubai", intro: "Lymphatic drainage, recovery and restorative treatments to feel your best." },
  INJECTABLES: { h1: "Aesthetic clinics in Dubai", intro: "Discreet, licensed clinics with a calm, premium feel for consultations and advanced skin." },
  GROOMING: { h1: "Men's grooming in Dubai", intro: "Sharp cuts, hot-towel detailing and beard sculpts from modern grooming houses." },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const key = category.toUpperCase();
  const copy = COPY[key];
  if (!copy) return { title: "Treatments" };
  return { title: copy.h1, description: copy.intro };
}

export default async function ServiceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const key = category.toUpperCase();
  if (!COPY[key]) notFound();
  const meta = categoryMeta(key);
  const copy = COPY[key];

  const venues = await prisma.venue.findMany({
    where: {
      approved: true,
      OR: [{ category: key }, { services: { some: { category: key } } }],
    },
    include: { services: { where: { category: key }, orderBy: { creditCost: "asc" }, take: 1 } },
    orderBy: { rating: "desc" },
  });

  return (
    <div>
      {/* Hero banner */}
      <div className="relative h-72 w-full overflow-hidden bg-cream sm:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CATEGORY_HERO[key]} alt={copy.h1} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/75 via-espresso/30 to-transparent" />
        <Section className="absolute inset-x-0 bottom-0 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">{meta.emoji} {meta.label}</p>
          <h1 className="mt-2 max-w-2xl font-serif text-4xl text-white sm:text-5xl">{copy.h1}</h1>
        </Section>
      </div>

      <Section className="py-10">
        <p className="max-w-xl text-lg text-espresso-soft">{copy.intro}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <LinkButton
              key={c.key}
              href={`/services/${c.key.toLowerCase()}`}
              variant={c.key === key ? "primary" : "outline"}
              size="sm"
            >
              {c.emoji} {c.label}
            </LinkButton>
          ))}
        </div>
      </Section>

      <Section className="pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((v) => (
            <VenueCard
              key={v.id}
              venue={{
                slug: v.slug,
                name: v.name,
                category: key,
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
    </div>
  );
}
