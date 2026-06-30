import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/app/(auth)/actions";
import { updateProfile } from "../actions";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const user = await requireUser();
  const goals: string[] = JSON.parse(user.goals || "[]");

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { venue: true },
  });

  return (
    <div className="space-y-6 px-5 py-5">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-espresso text-2xl text-cream">
          {user.name[0]}
        </div>
        <div>
          <h1 className="font-serif text-2xl text-espresso">{user.name}</h1>
          <p className="text-sm text-espresso-soft">{user.email}</p>
        </div>
      </div>

      {saved && (
        <p className="rounded-xl bg-sage/15 px-4 py-2.5 text-sm text-sage">Preferences saved ✦</p>
      )}

      {/* Favourites */}
      {favorites.length > 0 && (
        <div>
          <h2 className="mb-3 font-serif text-xl text-espresso">Favourite venues</h2>
          <div className="space-y-2">
            {favorites.map((f) => (
              <Link
                key={f.id}
                href={`/app/venues/${f.venue.slug}`}
                className="flex items-center gap-3 rounded-xl border border-line bg-white p-2.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.venue.imageUrl} alt={f.venue.name} className="h-12 w-12 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-medium text-espresso">{f.venue.name}</p>
                  <p className="text-xs text-espresso-soft">{f.venue.neighbourhood}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Beauty profile */}
      <ProfileForm
        action={updateProfile}
        defaults={{ name: user.name, city: user.city, budget: user.budget, goals }}
      />

      {/* Links */}
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
        {[
          { href: "/app/passport", label: "🛂 Glow Passport" },
          { href: "/app/membership", label: "♚ Membership & rewards" },
          { href: "/journal", label: "📖 Glow Journal" },
          { href: "/partners", label: "✦ Browse all venues" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center justify-between px-4 py-3.5 text-sm text-espresso">
            {l.label} <span className="text-espresso-soft">→</span>
          </Link>
        ))}
      </div>

      <form action={signOut}>
        <button className="w-full rounded-full border border-line py-3 text-sm text-espresso-soft transition hover:text-espresso">
          Sign out
        </button>
      </form>
    </div>
  );
}
