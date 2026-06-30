import type { Metadata } from "next";
import { Section, Eyebrow, Card } from "@/components/ui";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Corporate wellness memberships",
  description:
    "Give your team a premium beauty and wellness benefit. Employer packages, executive grooming and women's wellness.",
};

export default function CorporatePage() {
  return (
    <div>
      <Section className="py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>For employers</Eyebrow>
            <h1 className="mt-3 font-serif text-5xl leading-tight text-espresso">
              A wellness benefit your team will actually use.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-espresso-soft">
              Offer Licensed to Glow memberships as a lifestyle and reward benefit —
              women&apos;s wellness, executive grooming and self-care that retains
              talent.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-espresso-soft">
              {[
                "Flexible employer packages and credit pools",
                "Executive grooming and women's wellness tracks",
                "Simple billing and usage reporting",
                "A reward that feels premium, not transactional",
              ].map((i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-champagne">✦</span> {i}
                </li>
              ))}
            </ul>
          </div>
          <Card className="p-8">
            <h2 className="font-serif text-2xl text-espresso">Talk to our team</h2>
            <p className="mt-2 text-sm text-espresso-soft">
              Tell us about your team and we&apos;ll build a package that fits.
            </p>
            <div className="mt-6">
              <LeadForm kind="corporate" />
            </div>
          </Card>
        </div>
      </Section>

      <Section className="pb-16">
        <div className="overflow-hidden rounded-[2rem] border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/1500815845799-7748ca339f27.jpg"
            alt="A calm wellness space"
            className="h-64 w-full object-cover sm:h-80"
          />
        </div>
      </Section>
    </div>
  );
}
