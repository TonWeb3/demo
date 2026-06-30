"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { getCurrentUser } from "./auth";

/**
 * Mock checkout / subscription activation.
 *
 * In production this is where you'd create a Stripe Checkout Session and
 * redirect to it (then activate the membership in a webhook). With no
 * STRIPE_SECRET_KEY set we simulate a successful subscription so the whole
 * flow is exercisable locally. The Membership row carries a `stripeCustomerId`
 * column ready for the real integration.
 */
export async function choosePlan(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/signup?plan=${planId}`);
  }

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) redirect("/pricing");

  const usingRealStripe = Boolean(process.env.STRIPE_SECRET_KEY);
  if (usingRealStripe) {
    // const session = await stripe.checkout.sessions.create({ ... })
    // redirect(session.url!)
    // Falls through to mock until keys are configured.
  }

  const renewalDate = new Date();
  renewalDate.setDate(renewalDate.getDate() + 30);

  await prisma.membership.upsert({
    where: { userId: user!.id },
    create: {
      userId: user!.id,
      planId: plan!.id,
      status: "ACTIVE",
      creditsRemaining: plan!.creditsPerMonth,
      renewalDate,
    },
    update: {
      planId: plan!.id,
      status: "ACTIVE",
      creditsRemaining: plan!.creditsPerMonth,
      renewalDate,
    },
  });

  await prisma.user.update({
    where: { id: user!.id },
    data: { tier: plan!.tier },
  });

  revalidatePath("/app/membership");
  redirect("/app/membership?activated=1");
}

export async function cancelMembership() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await prisma.membership.updateMany({
    where: { userId: user.id },
    data: { status: "CANCELED" },
  });
  revalidatePath("/app/membership");
  redirect("/app/membership?canceled=1");
}
