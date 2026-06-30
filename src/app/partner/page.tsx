import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { aed, categoryMeta } from "@/lib/constants";
import { Badge } from "@/components/ui";
import DashShell, { Stat } from "@/components/DashShell";
import { setBookingStatus } from "./actions";

export default async function PartnerDashboard() {
  const user = await requireRole("PARTNER");

  // Admins see all venues; partners see only their own.
  const venueWhere = user.role === "ADMIN" ? {} : { ownerId: user.id };
  const venues = await prisma.venue.findMany({
    where: venueWhere,
    include: {
      services: true,
      bookings: { include: { service: true, user: true }, orderBy: { date: "desc" } },
      reviews: true,
    },
  });

  const allBookings = venues.flatMap((v) => v.bookings);
  const revenue = allBookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((s, b) => s + b.retailValue, 0);
  const completed = allBookings.filter((b) => b.status === "COMPLETED").length;
  const upcoming = allBookings.filter((b) => b.status === "UPCOMING");
  const avgRating =
    venues.length > 0
      ? (venues.reduce((s, v) => s + v.rating, 0) / venues.length).toFixed(1)
      : "—";
  const utilisation = allBookings.length
    ? Math.round((completed / allBookings.length) * 100)
    : 0;

  return (
    <DashShell
      title={`Welcome, ${user.name.split(" ")[0]}`}
      subtitle="Your venues, bookings and performance at a glance."
      badge="Partner portal"
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Revenue (booked)" value={aed(revenue)} hint="Completed visits" />
        <Stat label="Avg rating" value={`${avgRating}★`} />
        <Stat label="Utilisation" value={`${utilisation}%`} hint="Completed / total" />
        <Stat label="Upcoming" value={String(upcoming.length)} />
      </div>

      {/* Check-in queue */}
      <h2 className="mt-10 font-serif text-2xl text-espresso">Member check-in</h2>
      <p className="text-sm text-espresso-soft">Upcoming bookings to check in or mark as no-show.</p>
      <div className="mt-4 space-y-3">
        {upcoming.length === 0 && (
          <p className="rounded-2xl border border-line bg-white p-6 text-sm text-espresso-soft">
            No upcoming bookings.
          </p>
        )}
        {upcoming.map((b) => (
          <div key={b.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-espresso">{b.user.name} · {b.service.name}</p>
              <p className="text-sm text-espresso-soft">
                {b.date.toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" })} ·{" "}
                {b.date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                {b.therapistPref ? ` · ${b.therapistPref}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <form action={setBookingStatus}>
                <input type="hidden" name="bookingId" value={b.id} />
                <input type="hidden" name="status" value="COMPLETED" />
                <button className="rounded-full bg-champagne px-4 py-2 text-sm font-medium text-espresso">Check in</button>
              </form>
              <form action={setBookingStatus}>
                <input type="hidden" name="bookingId" value={b.id} />
                <input type="hidden" name="status" value="NO_SHOW" />
                <button className="rounded-full border border-line px-4 py-2 text-sm text-espresso-soft hover:text-red-600">No-show</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Venues */}
      <h2 className="mt-10 font-serif text-2xl text-espresso">Your venues</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {venues.map((v) => {
          const cat = categoryMeta(v.category);
          return (
            <div key={v.id} className="overflow-hidden rounded-2xl border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.imageUrl} alt={v.name} className="h-32 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-serif text-lg text-espresso">{v.name}</p>
                  <Badge tone={v.approved ? "sage" : "default"}>{v.approved ? "Live" : "Pending"}</Badge>
                </div>
                <p className="text-sm text-espresso-soft">{cat.emoji} {cat.label} · {v.neighbourhood}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-cream py-2">
                    <p className="font-medium text-espresso">{v.services.length}</p>
                    <p className="text-espresso-soft">services</p>
                  </div>
                  <div className="rounded-lg bg-cream py-2">
                    <p className="font-medium text-espresso">{v.bookings.length}</p>
                    <p className="text-espresso-soft">bookings</p>
                  </div>
                  <div className="rounded-lg bg-cream py-2">
                    <p className="font-medium text-espresso">{v.rating.toFixed(1)}★</p>
                    <p className="text-espresso-soft">{v.reviews.length} reviews</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashShell>
  );
}
