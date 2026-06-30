import Link from "next/link";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: {
  variant?: "primary" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
} & ComponentProps<"button">) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-6 py-3 text-sm",
        size === "lg" && "px-8 py-4 text-base",
        variant === "primary" &&
          "bg-champagne text-espresso hover:bg-champagne-deep hover:text-white shadow-sm",
        variant === "dark" && "bg-espresso text-cream hover:bg-espresso-soft",
        variant === "outline" &&
          "border border-line bg-transparent text-espresso hover:border-champagne hover:bg-cream",
        variant === "ghost" && "text-espresso-soft hover:text-espresso hover:bg-cream",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300",
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-6 py-3 text-sm",
        size === "lg" && "px-8 py-4 text-base",
        variant === "primary" &&
          "bg-champagne text-espresso hover:bg-champagne-deep hover:text-white shadow-sm",
        variant === "dark" && "bg-espresso text-cream hover:bg-espresso-soft",
        variant === "outline" &&
          "border border-line bg-transparent text-espresso hover:border-champagne hover:bg-cream",
        variant === "ghost" && "text-espresso-soft hover:text-espresso hover:bg-cream",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-xl2)] border border-line bg-white/70 backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "gold" | "sage" | "dark" | "new";
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "default" && "bg-cream text-espresso-soft",
        tone === "gold" && "bg-champagne/20 text-champagne-deep",
        tone === "sage" && "bg-sage/20 text-sage",
        tone === "dark" && "bg-espresso text-cream",
        tone === "new" && "bg-sage text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne-deep">
      {children}
    </p>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-0.5 text-champagne", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden className={i < Math.round(rating) ? "" : "text-line"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Section({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>
      {children}
    </section>
  );
}
