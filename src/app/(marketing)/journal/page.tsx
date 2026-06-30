import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Section, Eyebrow, Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Glow Journal",
  description:
    "Beauty routines, city guides, expert tips and treatment explainers from Licensed to Glow.",
};

export default async function JournalPage() {
  const posts = await prisma.journalPost.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <Section className="py-14">
        <Eyebrow>The Edit</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl text-espresso sm:text-5xl">Glow Journal</h1>
        <p className="mt-3 max-w-xl text-espresso-soft">
          A curated city guide to looking and feeling your best — routines, edits
          and the venues worth knowing.
        </p>
      </Section>
      <Section className="pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/journal/${p.slug}`}
              className="group overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-white"
            >
              <div className="aspect-[16/10] overflow-hidden bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <div className="p-5">
                <Badge tone="sage">{p.category}</Badge>
                <h2 className="mt-3 font-serif text-xl text-espresso">{p.title}</h2>
                <p className="mt-2 text-sm text-espresso-soft">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
