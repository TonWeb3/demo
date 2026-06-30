"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/** Partner check-in: mark a booking at an owned venue as completed or no-show. */
export async function setBookingStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("bookingId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["COMPLETED", "NO_SHOW"].includes(status)) return;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { venue: true },
  });
  if (!booking) return;
  // Owner (or admin) only.
  if (user.role !== "ADMIN" && booking.venue.ownerId !== user.id) return;

  await prisma.booking.update({ where: { id }, data: { status } });
  revalidatePath("/partner");
}
