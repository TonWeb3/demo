import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/(auth)/actions";

export default function DashShell({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-porcelain">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-lg text-espresso">Licensed to Glow</Link>
            <span className="rounded-full bg-espresso px-2.5 py-1 text-xs text-cream">{badge}</span>
          </div>
          <form action={signOut}>
            <button className="text-sm text-espresso-soft hover:text-espresso">Sign out</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <h1 className="font-serif text-3xl text-espresso">{title}</h1>
        <p className="mt-1 text-espresso-soft">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-espresso-soft">{label}</p>
      <p className="mt-1 font-serif text-3xl text-espresso">{value}</p>
      {hint && <p className="mt-1 text-xs text-sage">{hint}</p>}
    </div>
  );
}
