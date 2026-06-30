import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { CATEGORIES, categoryMeta } from "@/lib/constants";

// Gimmick 1: The Glow Passport (Doc §10)
export default async function PassportPage() {
  const user = await requireUser();
  const stamps = await prisma.passportStamp.findMany({
    where: { userId: user.id },
    orderBy: { earnedAt: "desc" },
  });

  // A row of "places to collect" — one per category. Completing the row unlocks a perk.
  const collected = new Set(stamps.map((s) => s.category));
  const rowComplete = CATEGORIES.every((c) => collected.has(c.key));

  return (
    <div className="space-y-6 px-5 py-5">
      <div>
        <p className="text-sm text-espresso-soft">Gimmick · collectible</p>
        <h1 className="font-serif text-3xl text-espresso">The Glow Passport 🛂</h1>
        <p className="mt-1 text-sm text-espresso-soft">
          Every completed booking stamps your passport. Collect one from each
          category to unlock a perk.
        </p>
      </div>

      {/* Category collection row */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="font-serif text-lg text-espresso">Category collection</p>
          <span className="text-sm text-espresso-soft">
            {collected.size}/{CATEGORIES.length}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {CATEGORIES.map((c) => {
            const have = collected.has(c.key);
            return (
              <div
                key={c.key}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center ${
                  have ? "border-champagne bg-champagne/10" : "border-dashed border-line opacity-60"
                }`}
              >
                <span className={`text-2xl ${have ? "" : "grayscale"}`}>{c.emoji}</span>
                <span className="text-[10px] text-espresso-soft">{c.label.split(" ")[0]}</span>
              </div>
            );
          })}
        </div>
        {rowComplete ? (
          <p className="mt-4 rounded-xl bg-sage/15 px-4 py-2.5 text-sm text-sage">
            Row complete ✦ a perk has been unlocked. Check your membership rewards.
          </p>
        ) : (
          <Link href="/app/search" className="mt-4 block rounded-full bg-champagne py-2.5 text-center text-sm font-medium text-espresso">
            Collect the next stamp
          </Link>
        )}
      </div>

      {/* Earned stamps */}
      <div>
        <h2 className="mb-3 font-serif text-xl text-espresso">Your stamps</h2>
        {stamps.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white p-6 text-center text-sm text-espresso-soft">
            No stamps yet — complete a booking and leave a review to earn your first.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {stamps.map((s) => {
              const cat = categoryMeta(s.category);
              return (
                <div key={s.id} className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-champagne text-xl">
                    {cat.emoji}
                  </div>
                  <p className="mt-3 font-medium text-espresso">{s.label}</p>
                  <p className="text-xs text-espresso-soft">
                    {s.earnedAt.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
