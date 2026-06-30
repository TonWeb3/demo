import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { categoryMeta } from "@/lib/constants";
import { Badge } from "@/components/ui";
import { cancelBooking, markAttended } from "../actions";
import ReviewForm from "./ReviewForm";
import { createReview } from "../actions";

const banners: Record<string, string> = {
  booked: "Booked — see you soon. Added to your calendar.",
  canceled: "Booking cancelled and credits returned.",
  attended: "Marked as attended — leave a review below.",
  reviewed: "Thank you for your review ✦ a Glow Passport stamp was added.",
};

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string; canceled?: string; attended?: string; reviewed?: string }>;
}) {
  const sp = await searchParams;
  const user = await requireUser();
  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { service: true, venue: true, review: true },
    orderBy: { date: "desc" },
  });

  const upcoming = bookings.filter((b) => b.status === "UPCOMING").sort((a, b) => +a.date - +b.date);
  const past = bookings.filter((b) => b.status !== "UPCOMING");
  const bannerKey = Object.keys(banners).find((k) => sp[k as keyof typeof sp]);

  return (
    <div className="px-5 py-5">
      <h1 className="font-serif text-3xl text-espresso">Your bookings</h1>
      <p className="mt-1 text-sm text-espresso-soft">Your beauty routine in one place.</p>

      {bannerKey && (
        <p className="mt-4 rounded-xl bg-sage/15 px-4 py-2.5 text-sm text-sage">
          {banners[bannerKey]}
        </p>
      )}

      {/* Upcoming */}
      <h2 className="mt-7 font-serif text-xl text-espresso">Upcoming</h2>
      <div className="mt-3 space-y-3">
        {upcoming.length === 0 && (
          <div className="rounded-2xl border border-line bg-white p-6 text-center text-sm text-espresso-soft">
            No upcoming bookings.{" "}
            <Link href="/app/search" className="text-champagne-deep underline">Find a treatment</Link>
          </div>
        )}
        {upcoming.map((b) => {
          const cat = categoryMeta(b.service.category);
          const cutoff = new Date(+b.date - 24 * 3600 * 1000);
          return (
            <div key={b.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cream text-xl">{cat.emoji}</div>
                <div className="flex-1">
                  <p className="font-medium text-espresso">{b.service.name}</p>
                  <p className="text-sm text-espresso-soft">{b.venue.name} · {b.venue.neighbourhood}</p>
                  <p className="mt-1 text-sm text-espresso">
                    {b.date.toLocaleDateString("en", { weekday: "long", day: "numeric", month: "short" })} · {b.date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {b.therapistPref && <p className="text-xs text-espresso-soft">{b.therapistPref}</p>}
                </div>
              </div>
              <p className="mt-3 text-xs text-espresso-soft">
                Free cancellation until {cutoff.toLocaleDateString("en", { day: "numeric", month: "short" })}
              </p>
              <div className="mt-2 flex gap-2">
                <form action={cancelBooking} className="flex-1">
                  <input type="hidden" name="bookingId" value={b.id} />
                  <button className="w-full rounded-full border border-line py-2 text-sm text-espresso-soft transition hover:border-red-300 hover:text-red-600">
                    Cancel
                  </button>
                </form>
                {b.date < now && (
                  <form action={markAttended} className="flex-1">
                    <input type="hidden" name="bookingId" value={b.id} />
                    <button className="w-full rounded-full bg-champagne py-2 text-sm font-medium text-espresso">
                      Mark attended
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Past */}
      <h2 className="mt-8 font-serif text-xl text-espresso">Past visits</h2>
      <div className="mt-3 space-y-3">
        {past.length === 0 && <p className="text-sm text-espresso-soft">No past visits yet.</p>}
        {past.map((b) => {
          const cat = categoryMeta(b.service.category);
          return (
            <div key={b.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cream text-xl">{cat.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-espresso">{b.service.name}</p>
                    <Badge tone={b.status === "COMPLETED" ? "sage" : "default"}>
                      {b.status === "COMPLETED" ? "Completed" : b.status === "CANCELED" ? "Cancelled" : "No-show"}
                    </Badge>
                  </div>
                  <p className="text-sm text-espresso-soft">{b.venue.name} · {b.venue.neighbourhood}</p>
                  <p className="mt-1 text-xs text-espresso-soft">
                    {b.date.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {b.status === "COMPLETED" && !b.review && (
                <ReviewForm bookingId={b.id} action={createReview} />
              )}
              {b.review && (
                <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-xs text-espresso-soft">
                  You rated this {b.review.rating}/5 ✦
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
