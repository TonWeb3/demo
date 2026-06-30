import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { choosePlan } from "@/lib/billing";
import { Section, Eyebrow, Badge, Button, LinkButton } from "@/components/ui";
import { aed } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Membership plans & pricing",
  description:
    "Compare Glow, Signature and Black Card memberships. Monthly credits across every partner venue, guest passes, priority booking and concierge support.",
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const [plans, session] = await Promise.all([
    prisma.plan.findMany({ orderBy: { order: "asc" } }),
    getSession(),
  ]);

  return (
    <div>
      <Section className="py-16 text-center">
        {welcome && (
          <Badge tone="gold" className="mb-4">
            Welcome — pick a plan to activate your membership
          </Badge>
        )}
        <Eyebrow>Membership</Eyebrow>
        <h1 className="mx-auto mt-4 max-w-2xl font-serif text-5xl leading-tight text-espresso">
          Choose how you glow
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-espresso-soft">
          One membership, credits to spend across every venue. Pause or cancel
          anytime. No coupons — just measurable value.
        </p>
      </Section>

      <Section className="pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const perks: string[] = JSON.parse(plan.perks);
            const featured = i === 1;
            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-[var(--radius-xl2)] border bg-white p-8 ${
                  featured ? "border-champagne ring-2 ring-champagne shadow-lg" : "border-line"
                }`}
              >
                {featured && <Badge tone="gold" className="mb-4 self-start">Most popular</Badge>}
                <h2 className="font-serif text-2xl text-espresso">{plan.name}</h2>
                <p className="mt-2 min-h-10 text-sm text-espresso-soft">{plan.description}</p>
                <p className="mt-6 font-serif text-4xl text-espresso">
                  {aed(plan.priceMonthly)}
                  <span className="text-base font-sans text-espresso-soft"> / mo</span>
                </p>

                <ul className="mt-6 space-y-3 text-sm">
                  {perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-espresso-soft">
                      <span className="mt-0.5 text-champagne">✦</span>
                      {perk}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-2">
                  {session ? (
                    <form action={choosePlan}>
                      <input type="hidden" name="planId" value={plan.id} />
                      <Button
                        type="submit"
                        variant={featured ? "primary" : "outline"}
                        className="w-full"
                        size="lg"
                      >
                        Choose {plan.name}
                      </Button>
                    </form>
                  ) : (
                    <LinkButton
                      href={`/signup?plan=${plan.id}`}
                      variant={featured ? "primary" : "outline"}
                      className="w-full"
                      size="lg"
                    >
                      Get {plan.name}
                    </LinkButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-espresso-soft">
          Credits roll within your billing cycle. Cancellation and no-show rules
          are shown clearly before every booking.
        </p>
      </Section>

      {/* FAQ */}
      <Section className="pb-20">
        <h2 className="mb-8 text-center font-serif text-3xl text-espresso">Common questions</h2>
        <div className="mx-auto grid max-w-3xl gap-4">
          {[
            { q: "How do credits work?", a: "Each treatment costs a set number of credits. Your plan refreshes credits every month, and you spend them across any partner venue." },
            { q: "Can I bring a friend?", a: "Signature and Black Card include guest passes each month so a friend can join you at member rates." },
            { q: "What if I need to cancel a booking?", a: "Each venue's cancellation window is shown before you confirm. Cancel inside the window and your credits return automatically." },
            { q: "Can I cancel my membership?", a: "Yes — anytime from your membership wallet. You keep access until the end of your billing cycle." },
          ].map((f) => (
            <details key={f.q} className="group rounded-2xl border border-line bg-white p-5">
              <summary className="cursor-pointer list-none font-medium text-espresso">
                {f.q}
              </summary>
              <p className="mt-3 text-sm text-espresso-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </div>
  );
}
