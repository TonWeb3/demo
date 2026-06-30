import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { aed, tierMeta, TIERS } from "@/lib/constants";
import { Badge, LinkButton } from "@/components/ui";
import { cancelMembership } from "@/lib/billing";
import { inviteFriend } from "../actions";

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ activated?: string; invited?: string; canceled?: string }>;
}) {
  const sp = await searchParams;
  const user = await requireUser();
  const m = user.membership;

  if (!m || m.status !== "ACTIVE") {
    return (
      <div className="px-5 py-10 text-center">
        <h1 className="font-serif text-3xl text-espresso">Activate your membership</h1>
        <p className="mt-2 text-sm text-espresso-soft">
          Choose a plan to start booking and tracking your glow.
        </p>
        <LinkButton href="/pricing?welcome=1" className="mt-6">Choose a plan</LinkButton>
      </div>
    );
  }

  const tier = tierMeta(user.tier);
  const referrals = await prisma.referral.count({ where: { referrerId: user.id } });
  const stamps = await prisma.passportStamp.count({ where: { userId: user.id } });

  // Tier progress: next tier threshold by visits this cycle (simplified)
  const visits = await prisma.booking.count({
    where: { userId: user.id, status: { in: ["UPCOMING", "COMPLETED"] } },
  });
  const tierIndex = TIERS.findIndex((t) => t.key === user.tier);
  const nextTier = TIERS[tierIndex + 1];
  const visitsToNext = Math.max(0, (tierIndex + 1) * 4 - visits);

  const valuePct = Math.min(100, Math.round((m.savedAmount / (m.plan.priceMonthly || 1)) * 100));

  return (
    <div className="space-y-6 px-5 py-5">
      {sp.activated && <Banner>Membership activated ✦ welcome to {m.plan.name}.</Banner>}
      {sp.invited && <Banner>Invite sent — you&apos;ll earn rewards when they join.</Banner>}
      {sp.canceled && <Banner tone="muted">Membership cancelled. Access continues until renewal.</Banner>}

      <h1 className="font-serif text-3xl text-espresso">Membership</h1>

      {/* Saved Money Flex Card (Gimmick 3) */}
      <div className="relative overflow-hidden rounded-3xl bg-espresso p-6 text-cream">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-champagne/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-cream/60">Licensed to Glow</span>
            <Badge tone="gold">{tier.name}</Badge>
          </div>
          <p className="mt-6 text-xs text-cream/60">Value unlocked this month</p>
          <p className="font-serif text-4xl text-champagne">{aed(m.savedAmount)}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
            <div>
              <p className="font-serif text-lg text-cream">{m.creditsRemaining}</p>
              <p className="text-cream/60">credits left</p>
            </div>
            <div>
              <p className="font-serif text-lg text-cream">{m.streakWeeks}w</p>
              <p className="text-cream/60">glow streak</p>
            </div>
            <div>
              <p className="font-serif text-lg text-cream">{stamps}</p>
              <p className="text-cream/60">stamps</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-cream/80">{user.name}</p>
        </div>
      </div>

      {/* Value vs cost */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-espresso-soft">Retail value used</span>
          <span className="font-medium text-espresso">{aed(m.retailUsed)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className="text-espresso-soft">Membership cost</span>
          <span className="font-medium text-espresso">{aed(m.plan.priceMonthly)} / mo</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cream">
          <div className="h-full rounded-full bg-champagne" style={{ width: `${valuePct}%` }} />
        </div>
        <p className="mt-2 text-xs text-sage">
          You&apos;ve unlocked {valuePct}% of your monthly value — your glow streak is {m.streakWeeks} weeks strong.
        </p>
      </div>

      {/* Plan + renewal */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-serif text-xl text-espresso">{m.plan.name} plan</p>
            <p className="text-sm text-espresso-soft">
              Renews {m.renewalDate.toLocaleDateString("en", { day: "numeric", month: "long" })}
            </p>
          </div>
          <Link href="/pricing" className="text-sm text-champagne-deep underline">Change</Link>
        </div>
      </div>

      {/* Tier progress (Doc §7.9) */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="font-serif text-xl text-espresso">Tier progress</p>
        {nextTier ? (
          <>
            <p className="mt-1 text-sm text-espresso-soft">
              You are {visitsToNext} {visitsToNext === 1 ? "visit" : "visits"} away from {nextTier.name} benefits.
            </p>
            <div className="mt-3 flex gap-2">
              {TIERS.map((t, i) => (
                <div
                  key={t.key}
                  className={`flex-1 rounded-xl border p-2.5 text-center text-xs ${
                    i <= tierIndex ? "border-champagne bg-champagne/15 text-champagne-deep" : "border-line text-espresso-soft"
                  }`}
                >
                  {t.name}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-sage">You&apos;re at our highest tier — Black Card. Enjoy ✦</p>
        )}
      </div>

      {/* Referral (Doc §7.8) */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="font-serif text-xl text-espresso">Invite friends</p>
        <p className="mt-1 text-sm text-espresso-soft">
          1 friend = bonus credit · 3 = free add-on · 5 = a tier upgrade for a month.
        </p>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-cream px-4 py-2.5">
          <span className="text-sm text-espresso-soft">Your code</span>
          <span className="font-mono text-sm font-medium text-espresso">{user.referralCode.slice(-6).toUpperCase()}</span>
        </div>
        <form action={inviteFriend} className="mt-3 flex gap-2">
          <input
            name="email"
            type="email"
            required
            placeholder="friend@email.com"
            className="flex-1 rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-champagne"
          />
          <button className="rounded-full bg-champagne px-5 py-2.5 text-sm font-medium text-espresso">Invite</button>
        </form>
        <p className="mt-2 text-xs text-espresso-soft">{referrals} invites sent · {m.plan.guestPasses} guest passes this month</p>
      </div>

      {/* Cancel */}
      <form action={cancelMembership}>
        <button className="w-full rounded-full border border-line py-3 text-sm text-espresso-soft transition hover:border-red-300 hover:text-red-600">
          Cancel membership
        </button>
      </form>
    </div>
  );
}

function Banner({ children, tone = "ok" }: { children: React.ReactNode; tone?: "ok" | "muted" }) {
  return (
    <p className={`rounded-xl px-4 py-2.5 text-sm ${tone === "ok" ? "bg-sage/15 text-sage" : "bg-cream text-espresso-soft"}`}>
      {children}
    </p>
  );
}
