"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const tabs = [
  { href: "/app", label: "Discover", icon: "✦", exact: true },
  { href: "/app/search", label: "Search", icon: "⌕" },
  { href: "/app/bookings", label: "Bookings", icon: "▦" },
  { href: "/app/membership", label: "Membership", icon: "♚" },
  { href: "/app/profile", label: "Profile", icon: "◔" },
];

export default function AppNav() {
  const pathname = usePathname();
  const isActive = (t: (typeof tabs)[number]) =>
    t.exact ? pathname === t.href : pathname.startsWith(t.href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-porcelain/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {tabs.map((t) => {
          const active = isActive(t);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition",
                active ? "text-champagne-deep" : "text-espresso-soft",
              )}
            >
              <span className={clsx("text-lg leading-none", active && "scale-110")}>{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
