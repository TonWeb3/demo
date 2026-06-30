import type { ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import AppNav from "@/components/AppNav";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const credits = user.membership?.creditsRemaining ?? 0;
  const hasPlan = user.membership?.status === "ACTIVE";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-porcelain pb-20">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-porcelain/90 px-5 py-3.5 backdrop-blur-md">
        <Link href="/app" className="font-serif text-lg tracking-tight text-espresso">
          Licensed to Glow
        </Link>
        <Link
          href="/app/membership"
          className="flex items-center gap-1.5 rounded-full bg-champagne/20 px-3 py-1.5 text-xs font-medium text-champagne-deep"
        >
          {hasPlan ? `${credits} credits` : "Activate plan"}
        </Link>
      </header>

      <main className="flex-1">{children}</main>

      <AppNav />
    </div>
  );
}
