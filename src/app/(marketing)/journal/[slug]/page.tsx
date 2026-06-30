import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Section, Eyebrow, Badge, LinkButton } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.journalPost.findUnique({ where: { slug } });
  if (!post) return { title: "Article" };
  return { title: post.title, description: post.excerpt };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.journalPost.findUnique({ where: { slug } });
  if (!post) notFound();

  return (
    <article>
      <Section className="max-w-3xl py-14">
        <Link href="/journal" className="text-sm text-champagne-deep hover:underline">
          ← Glow Journal
        </Link>
        <Badge tone="sage" className="mt-5">{post.category}</Badge>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-espresso sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-espresso-soft">{post.excerpt}</p>
      </Section>

      <Section className="max-w-3xl">
        <div className="overflow-hidden rounded-[var(--radius-xl2)] border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt={post.title} className="aspect-[16/9] w-full object-cover" />
        </div>
      </Section>

      <Section className="max-w-3xl py-10">
        <div className="prose space-y-5 text-espresso-soft">
          <p className="text-lg leading-relaxed">{post.body}</p>
          <p className="leading-relaxed">
            Everything in this edit is bookable with your membership credits — turn
            inspiration into your next appointment in a couple of taps.
          </p>
        </div>

        <div className="mt-12 rounded-[var(--radius-xl2)] border border-line bg-cream p-8 text-center">
          <Eyebrow>Turn the edit into a booking</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl text-espresso">Ready to glow?</h2>
          <LinkButton href="/partners" className="mt-5">Browse venues</LinkButton>
        </div>
      </Section>
    </article>
  );
}
