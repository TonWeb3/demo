"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function setVenueApproval(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("venueId") ?? "");
  const approved = String(formData.get("approved") ?? "") === "true";
  await prisma.venue.update({ where: { id }, data: { approved } });
  revalidatePath("/admin");
}

export async function toggleSpotlight(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("venueId") ?? "");
  const venue = await prisma.venue.findUnique({ where: { id } });
  if (!venue) return;
  await prisma.venue.update({ where: { id }, data: { spotlight: !venue.spotlight } });
  revalidatePath("/admin");
}
