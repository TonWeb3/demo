import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-espresso p-12 text-cream lg:flex">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(/images/1540555700478-4be289fbecef.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            Licensed to Glow
          </Link>
        </div>
        <div className="relative max-w-md">
          <p className="font-serif text-3xl leading-snug">
            Your beauty life, organised beautifully.
          </p>
          <p className="mt-4 text-cream/70">
            One membership for the salons, spas and clinics worth returning to.
          </p>
        </div>
        <div className="relative text-sm text-cream/50">
          Curated access · Easy booking · Measurable value
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-porcelain px-5 py-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-block font-serif text-xl tracking-tight text-espresso lg:hidden"
          >
            Licensed to Glow
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
