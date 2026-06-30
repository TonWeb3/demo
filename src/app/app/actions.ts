"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/** Create a booking, spending membership credits (Doc §7 Booking flow). */
export async function createBooking(formData: FormData) {
  const user = await requireUser();
  const serviceId = String(formData.get("serviceId") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  const therapistPref = String(formData.get("therapistPref") ?? "") || null;

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { venue: true },
  });
  if (!service) redirect("/app");

  const membership = await prisma.membership.findUnique({ where: { userId: user.id } });
  if (!membership || membership.status !== "ACTIVE") {
    redirect("/pricing?welcome=1");
  }
  if (membership!.creditsRemaining < service!.creditCost) {
    redirect(`/app/book/${serviceId}?error=credits`);
  }

  const date = dateStr ? new Date(dateStr) : new Date();

  await prisma.$transaction([
    prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: service!.id,
        venueId: service!.venueId,
        date,
        status: "UPCOMING",
        creditsUsed: service!.creditCost,
        retailValue: service!.retailPrice,
        therapistPref: therapistPref ?? undefined,
      },
    }),
    prisma.membership.update({
      where: { userId: user.id },
      data: {
        creditsRemaining: { decrement: service!.creditCost },
        retailUsed: { increment: service!.retailPrice },
        savedAmount: { increment: service!.retailPrice },
      },
    }),
  ]);

  revalidatePath("/app/bookings");
  revalidatePath("/app/membership");
  redirect("/app/bookings?booked=1");
}

/** Cancel an upcoming booking and refund credits. */
export async function cancelBooking(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== user.id || booking.status !== "UPCOMING") {
    redirect("/app/bookings");
  }

  await prisma.$transaction([
    prisma.booking.update({ where: { id }, data: { status: "CANCELED" } }),
    prisma.membership.update({
      where: { userId: user.id },
      data: {
        creditsRemaining: { increment: booking!.creditsUsed },
        retailUsed: { decrement: booking!.retailValue },
        savedAmount: { decrement: booking!.retailValue },
      },
    }),
  ]);

  revalidatePath("/app/bookings");
  revalidatePath("/app/membership");
  redirect("/app/bookings?canceled=1");
}

/** Demo helper: mark a past upcoming booking as attended so it can be reviewed. */
export async function markAttended(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== user.id) redirect("/app/bookings");
  await prisma.booking.update({ where: { id }, data: { status: "COMPLETED" } });
  revalidatePath("/app/bookings");
  redirect(`/app/bookings?attended=1`);
}

/** Create a verified review for an attended booking (Doc §7.7). */
export async function createReview(formData: FormData) {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { venue: true, service: true, review: true },
  });
  if (!booking || booking.userId !== user.id || booking.status !== "COMPLETED" || booking.review) {
    redirect("/app/bookings");
  }

  const n = (k: string, d = 5) => {
    const v = Number(formData.get(k));
    return Number.isFinite(v) && v >= 1 && v <= 5 ? v : d;
  };
  const tags = formData.getAll("tags").map(String);
  const notes = String(formData.get("notes") ?? "") || null;
  const rating = n("rating");

  await prisma.review.create({
    data: {
      bookingId: booking!.id,
      userId: user.id,
      venueId: booking!.venueId,
      serviceId: booking!.serviceId,
      rating,
      cleanliness: n("cleanliness"),
      therapist: n("therapist"),
      result: n("result"),
      ambience: n("ambience"),
      value: n("value"),
      tags: JSON.stringify(tags),
      notes: notes ?? undefined,
    },
  });

  // Add a Glow Passport stamp (Gimmick 1) and update venue rating aggregate.
  const agg = await prisma.review.aggregate({
    where: { venueId: booking!.venueId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.$transaction([
    prisma.venue.update({
      where: { id: booking!.venueId },
      data: { rating: agg._avg.rating ?? rating, reviewCount: agg._count },
    }),
    prisma.passportStamp.create({
      data: {
        userId: user.id,
        label: `${booking!.venue.neighbourhood} ${booking!.service.category[0]}${booking!.service.category.slice(1).toLowerCase()}`,
        category: booking!.service.category,
      },
    }),
  ]);

  revalidatePath("/app/bookings");
  revalidatePath("/app/passport");
  redirect("/app/bookings?reviewed=1");
}

/** Invite a friend (Doc §7.8 referral system). */
export async function inviteFriend(formData: FormData) {
  const user = await requireUser();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/app/membership");
  await prisma.referral.create({
    data: { referrerId: user.id, code: user.referralCode, friendEmail: email },
  });
  revalidatePath("/app/membership");
  redirect("/app/membership?invited=1");
}

/** Toggle a favourite venue. */
export async function toggleFavorite(formData: FormData) {
  const user = await requireUser();
  const venueId = String(formData.get("venueId") ?? "");
  const existing = await prisma.favorite.findUnique({
    where: { userId_venueId: { userId: user.id, venueId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId: user.id, venueId } });
  }
  revalidatePath(`/app/venues`);
}

/** Update beauty profile / preferences. */
export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? user.name);
  const city = String(formData.get("city") ?? user.city);
  const budget = String(formData.get("budget") ?? user.budget);
  const goals = formData.getAll("goals").map(String);
  await prisma.user.update({
    where: { id: user.id },
    data: { name, city, budget, goals: JSON.stringify(goals) },
  });
  revalidatePath("/app/profile");
  redirect("/app/profile?saved=1");
}
