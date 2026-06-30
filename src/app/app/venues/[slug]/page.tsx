import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { categoryMeta, aed } from "@/lib/constants";
import { Badge, Stars, LinkButton } from "@/components/ui";
import { toggleFavorite } from "../../actions";

export default async function AppVenuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();
  const venue = await prisma.venue.findUnique({
    where: { slug },
    include: {
      services: { orderBy: { creditCost: "asc" } },
      reviews: { include: { user: true, service: true }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!venue || !venue.approved) notFound();

  const fav = await prisma.favorite.findUnique({
    where: { userId_venueId: { userId: user.id, venueId: venue.id } },
  });
  const cat = categoryMeta(venue.category);
  const amenities: string[] = JSON.parse(venue.amenities);
  const gallery: string[] = JSON.parse(venue.gallery || "[]");

  return (
    <div>
      <div className="relative h-60 w-full overflow-hidden bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={venue.imageUrl} alt={venue.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent" />
        <Link href="/app/search" className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-espresso">←</Link>
        <form action={toggleFavorite} className="absolute right-4 top-4">
          <input type="hidden" name="venueId" value={venue.id} />
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white/85 text-lg">
            {fav ? "♥" : "♡"}
          </button>
        </form>
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <Badge tone="dark">{cat.emoji} {cat.label}</Badge>
          <h1 className="mt-2 font-serif text-2xl">{venue.name}</h1>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <Stars rating={venue.rating} className="text-xs" />
            {venue.rating.toFixed(1)} ({venue.reviewCount}) · {venue.neighbourhood}
          </div>
        </div>
      </div>

      <div className="space-y-7 px-5 py-5">
        <p className="text-sm text-espresso-soft">{venue.description}</p>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => <Badge key={a}>{a}</Badge>)}
        </div>

        {/* Gallery */}
        {gallery.length > 1 && (
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5">
            {gallery.slice(1).map((src, i) => (
              <div key={src} className="h-28 w-40 shrink-0 overflow-hidden rounded-2xl bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${venue.name} ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div>
          <h2 className="mb-3 font-serif text-xl text-espresso">Treatments</h2>
          <div className="space-y-3">
            {venue.services.map((s) => (
              <div key={s.id} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex items-start gap-3">
                  {s.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={s.imageUrl} alt={s.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-espresso">{s.name}</p>
                      <span className="shrink-0 text-sm font-medium text-champagne-deep">{s.creditCost} cr</span>
                    </div>
                    <p className="mt-0.5 text-xs text-espresso-soft">
                      {s.durationMin} min · {s.therapistLevel} · retail {aed(s.retailPrice)}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-espresso-soft">{s.description}</p>
                <LinkButton href={`/app/book/${s.id}`} size="sm" className="mt-3 w-full">
                  Book this treatment
                </LinkButton>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-serif text-xl text-espresso">Reviews</h2>
          <div className="space-y-3">
            {venue.reviews.length === 0 && <p className="text-sm text-espresso-soft">No reviews yet.</p>}
            {venue.reviews.map((r) => {
              const tags: string[] = JSON.parse(r.tags);
              return (
                <div key={r.id} className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-espresso">{r.user.name}</p>
                    <Stars rating={r.rating} className="text-xs" />
                  </div>
                  {r.notes && <p className="mt-2 text-sm text-espresso-soft">“{r.notes}”</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tags.map((t) => <Badge key={t}>{t}</Badge>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
