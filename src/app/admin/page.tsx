import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { aed, categoryMeta } from "@/lib/constants";
import { Badge } from "@/components/ui";
import DashShell, { Stat } from "@/components/DashShell";
import { setVenueApproval, toggleSpotlight } from "./actions";

export default async function AdminDashboard() {
  await requireRole("ADMIN");

  const [members, venues, bookings, memberships, plans, recentReviews] = await Promise.all([
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.venue.findMany({ include: { owner: true, _count: { select: { bookings: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.booking.count(),
    prisma.membership.findMany({ where: { status: "ACTIVE" }, include: { plan: true } }),
    prisma.plan.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { memberships: true } } } }),
    prisma.review.findMany({ include: { user: true, venue: true }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const mrr = memberships.reduce((s, m) => s + m.plan.priceMonthly, 0);
  const pending = venues.filter((v) => !v.approved);
  const liquidity = venues.filter((v) => v.approved).length
    ? Math.round((venues.filter((v) => v.approved && v._count.bookings > 0).length / venues.filter((v) => v.approved).length) * 100)
    : 0;

  return (
    <DashShell
      title="Operations"
      subtitle="Marketplace health, supply approvals and quality control."
      badge="Admin"
    >
      {/* Metrics (Doc §15) */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Active members" value={String(members)} />
        <Stat label="MRR" value={aed(mrr)} hint={`${memberships.length} active subs`} />
        <Stat label="Total bookings" value={String(bookings)} />
        <Stat label="Marketplace liquidity" value={`${liquidity}%`} hint="Venues with bookings" />
      </div>

      {/* Plan mix */}
      <h2 className="mt-10 font-serif text-2xl text-espresso">Plan mix</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="font-serif text-lg text-espresso">{p.name}</p>
              <span className="text-sm text-espresso-soft">{aed(p.priceMonthly)}/mo</span>
            </div>
            <p className="mt-2 font-serif text-3xl text-champagne-deep">{p._count.memberships}</p>
            <p className="text-xs text-espresso-soft">active members</p>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      <h2 className="mt-10 font-serif text-2xl text-espresso">
        Venue approvals {pending.length > 0 && <Badge tone="gold">{pending.length} pending</Badge>}
      </h2>
      <div className="mt-4 space-y-3">
        {venues.map((v) => {
          const cat = categoryMeta(v.category);
          return (
            <div key={v.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.imageUrl} alt={v.name} className="h-12 w-12 rounded-lg object-cover" />
                <div>
                  <p className="font-medium text-espresso">
                    {v.name} <span className="text-espresso-soft">· {cat.label}</span>
                  </p>
                  <p className="text-xs text-espresso-soft">
                    {v.neighbourhood} · {v._count.bookings} bookings · owner {v.owner?.name ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={v.approved ? "sage" : "default"}>{v.approved ? "Live" : "Pending"}</Badge>
                {v.spotlight && <Badge tone="gold">Spotlight</Badge>}
                <form action={toggleSpotlight}>
                  <input type="hidden" name="venueId" value={v.id} />
                  <button className="rounded-full border border-line px-3 py-1.5 text-xs text-espresso-soft hover:border-champagne">
                    {v.spotlight ? "Unspotlight" : "Spotlight"}
                  </button>
                </form>
                <form action={setVenueApproval}>
                  <input type="hidden" name="venueId" value={v.id} />
                  <input type="hidden" name="approved" value={(!v.approved).toString()} />
                  <button
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      v.approved ? "border border-line text-espresso-soft hover:text-red-600" : "bg-champagne text-espresso"
                    }`}
                  >
                    {v.approved ? "Suspend" : "Approve"}
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent reviews / quality */}
      <h2 className="mt-10 font-serif text-2xl text-espresso">Recent reviews</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {recentReviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-espresso">{r.venue.name}</p>
              <span className="text-champagne">{"★".repeat(r.rating)}</span>
            </div>
            <p className="text-xs text-espresso-soft">by {r.user.name}</p>
            {r.notes && <p className="mt-2 text-sm text-espresso-soft">“{r.notes}”</p>}
          </div>
        ))}
      </div>
    </DashShell>
  );
}
