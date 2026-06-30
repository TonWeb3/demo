import Link from "next/link";
import { Badge, Stars } from "./ui";
import { categoryMeta } from "@/lib/constants";

export type VenueCardData = {
  slug: string;
  name: string;
  category: string;
  neighbourhood: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  isNew?: boolean;
  fromPrice?: number;
  href?: string;
};

export default function VenueCard({ venue }: { venue: VenueCardData }) {
  const cat = categoryMeta(venue.category);
  const href = venue.href ?? `/partners/${venue.slug}`;
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(43,33,24,0.25)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venue.imageUrl}
          alt={venue.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone="dark">
            {cat.emoji} {cat.label.split(" ")[0]}
          </Badge>
          {venue.isNew && <Badge tone="new">New</Badge>}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg leading-tight text-espresso">{venue.name}</h3>
          <span className="shrink-0 text-sm text-espresso-soft">{venue.neighbourhood}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Stars rating={venue.rating} />
          <span className="text-espresso">{venue.rating.toFixed(1)}</span>
          <span className="text-espresso-soft">({venue.reviewCount})</span>
        </div>
        {venue.fromPrice != null && (
          <p className="mt-2 text-xs text-espresso-soft">
            From{" "}
            <span className="font-medium text-champagne-deep">
              {venue.fromPrice} credit{venue.fromPrice === 1 ? "" : "s"}
            </span>{" "}
            · included in plan
          </p>
        )}
      </div>
    </Link>
  );
}
