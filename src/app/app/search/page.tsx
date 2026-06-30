import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { CATEGORIES, AREAS, categoryMeta } from "@/lib/constants";
import { Stars, Badge } from "@/components/ui";
import { clsx } from "clsx";

type SP = { q?: string; category?: string; area?: string; view?: string };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  await requireUser();
  const { q, category, area, view } = await searchParams;
  const isMap = view === "map";

  const venues = await prisma.venue.findMany({
    where: {
      approved: true,
      ...(category ? { category } : {}),
      ...(area ? { neighbourhood: area } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { neighbourhood: { contains: q } },
              { description: { contains: q } },
              { services: { some: { name: { contains: q } } } },
            ],
          }
        : {}),
    },
    include: { services: { orderBy: { creditCost: "asc" }, take: 1 } },
    orderBy: [{ spotlight: "desc" }, { rating: "desc" }],
  });

  const qp = (extra: Partial<SP>) => {
    const merged: Record<string, string> = {};
    if (q) merged.q = q;
    if (category) merged.category = category;
    if (area) merged.area = area;
    if (view) merged.view = view;
    Object.entries(extra).forEach(([k, v]) => {
      if (v) merged[k] = v;
      else delete merged[k];
    });
    return "/app/search?" + new URLSearchParams(merged).toString();
  };

  return (
    <div className="px-5 py-5">
      {/* Search box */}
      <form action="/app/search" method="get" className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3">
        <span className="text-lg text-espresso-soft">⌕</span>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search treatments, venues, areas…"
          className="w-full bg-transparent text-sm outline-none"
        />
        {category && <input type="hidden" name="category" value={category} />}
      </form>

      {/* Category filter */}
      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        <Chip href={qp({ category: undefined })} active={!category}>All</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.key} href={qp({ category: c.key })} active={category === c.key}>
            {c.emoji} {c.label.split(" ")[0]}
          </Chip>
        ))}
      </div>

      {/* Area filter */}
      <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1">
        {AREAS.map((a) => (
          <Chip key={a} href={qp({ area: area === a ? undefined : a })} active={area === a} small>
            {a}
          </Chip>
        ))}
      </div>

      {/* View toggle + count */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-espresso-soft">{venues.length} venues</p>
        <div className="flex rounded-full border border-line bg-white p-0.5 text-xs">
          <Link href={qp({ view: undefined })} className={clsx("rounded-full px-3 py-1", !isMap ? "bg-champagne/20 text-champagne-deep" : "text-espresso-soft")}>List</Link>
          <Link href={qp({ view: "map" })} className={clsx("rounded-full px-3 py-1", isMap ? "bg-champagne/20 text-champagne-deep" : "text-espresso-soft")}>Map</Link>
        </div>
      </div>

      {isMap ? (
        <MapView venues={venues} />
      ) : (
        <div className="mt-4 space-y-3">
          {venues.map((v) => {
            const cat = categoryMeta(v.category);
            return (
              <Link
                key={v.id}
                href={`/app/venues/${v.slug}`}
                className="flex gap-3 overflow-hidden rounded-2xl border border-line bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.imageUrl} alt={v.name} className="h-28 w-28 shrink-0 object-cover" />
                <div className="min-w-0 flex-1 py-3 pr-3">
                  <div className="flex items-center gap-1.5">
                    <Badge tone="default">{cat.emoji} {cat.label.split(" ")[0]}</Badge>
                    {v.isNew && <Badge tone="new">New</Badge>}
                  </div>
                  <p className="mt-1 truncate font-serif text-base text-espresso">{v.name}</p>
                  <div className="flex items-center gap-1 text-xs text-espresso-soft">
                    <Stars rating={v.rating} className="text-[10px]" />
                    <span>{v.rating.toFixed(1)} · {v.neighbourhood}</span>
                  </div>
                  {v.services[0] && (
                    <p className="mt-1 text-xs text-champagne-deep">
                      From {v.services[0].creditCost} credit{v.services[0].creditCost === 1 ? "" : "s"} · included
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
          {venues.length === 0 && (
            <p className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-espresso-soft">
              Nothing matches yet. Try a different filter.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({
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
        "shrink-0 rounded-full border transition",
        small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        active ? "border-champagne bg-champagne/20 text-champagne-deep" : "border-line bg-white text-espresso-soft",
      )}
    >
      {children}
    </Link>
  );
}

// Keyless map: positions pins on a stylised canvas using normalised lat/lng.
function MapView({
  venues,
}: {
  venues: { id: string; slug: string; name: string; lat: number; lng: number; category: string; neighbourhood: string }[];
}) {
  if (venues.length === 0) {
    return <p className="mt-4 rounded-2xl border border-line bg-white p-8 text-center text-sm text-espresso-soft">No venues to map.</p>;
  }
  const lats = venues.map((v) => v.lat);
  const lngs = venues.map((v) => v.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const pos = (v: { lat: number; lng: number }) => ({
    left: `${8 + ((v.lng - minLng) / (maxLng - minLng || 1)) * 84}%`,
    top: `${88 - ((v.lat - minLat) / (maxLat - minLat || 1)) * 76}%`,
  });

  return (
    <div className="mt-4">
      <div className="relative h-80 overflow-hidden rounded-2xl border border-line bg-[radial-gradient(circle_at_30%_20%,#eef1ec,#f4efe6)]">
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(#e7ddcd 1px,transparent 1px),linear-gradient(90deg,#e7ddcd 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {venues.map((v) => {
          const cat = categoryMeta(v.category);
          return (
            <Link
              key={v.id}
              href={`/app/venues/${v.slug}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={pos(v)}
              title={v.name}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-espresso text-sm shadow-md">
                {cat.emoji}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="mt-3 space-y-2">
        {venues.map((v) => (
          <Link key={v.id} href={`/app/venues/${v.slug}`} className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-2.5 text-sm">
            <span className="font-medium text-espresso">{categoryMeta(v.category).emoji} {v.name}</span>
            <span className="text-espresso-soft">{v.neighbourhood} →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
