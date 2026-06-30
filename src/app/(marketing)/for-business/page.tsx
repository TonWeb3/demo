import type { Metadata } from "next";
import { Section, Eyebrow, Card } from "@/components/ui";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Partner with Licensed to Glow",
  description:
    "Fill off-peak slots, acquire affluent members and grow repeat visits. Join the curated beauty membership marketplace.",
};

export default function ForBusinessPage() {
  return (
    <div>
      <Section className="py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>For venues</Eyebrow>
            <h1 className="mt-3 font-serif text-5xl leading-tight text-espresso">
              Fill quiet slots with members worth keeping.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-espresso-soft">
              Licensed to Glow brings affluent, repeat-booking members to premium
              venues — a predictable acquisition channel that monetises your
              off-peak inventory.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { v: "+38%", k: "Off-peak utilisation" },
                { v: "4.8★", k: "Avg member rating" },
                { v: "62%", k: "Rebooking rate" },
              ].map((s) => (
                <div key={s.k}>
                  <p className="font-serif text-3xl text-champagne-deep">{s.v}</p>
                  <p className="mt-1 text-xs text-espresso-soft">{s.k}</p>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-8">
            <h2 className="font-serif text-2xl text-espresso">Request partner info</h2>
            <p className="mt-2 text-sm text-espresso-soft">
              Tell us about your venue and we&apos;ll share utilisation analytics and
              payout options.
            </p>
            <div className="mt-6">
              <LeadForm kind="partner" />
            </div>
          </Card>
        </div>
      </Section>

      <Section className="py-6">
        <div className="overflow-hidden rounded-[2rem] border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/1574015974293-817f0ebebb74.jpg"
            alt="A premium partner venue"
            className="h-64 w-full object-cover sm:h-80"
          />
        </div>
      </Section>

      <Section className="py-12">
        <h2 className="text-center font-serif text-3xl text-espresso">Why partners join</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { t: "Predictable acquisition", d: "A steady stream of members discovering and booking your venue — no per-lead ad spend." },
            { t: "Monetise off-peak", d: "Offer included slots and member rates when you'd otherwise sit empty." },
            { t: "Tools that do the work", d: "A partner portal for availability, check-in, settlement and performance analytics." },
          ].map((f) => (
            <Card key={f.t} className="p-7">
              <h3 className="font-serif text-xl text-espresso">{f.t}</h3>
              <p className="mt-2 text-sm text-espresso-soft">{f.d}</p>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
