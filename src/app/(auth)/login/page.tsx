"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "../actions";
import { Button } from "@/components/ui";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-champagne focus:ring-2 focus:ring-champagne/30";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <div>
      <h1 className="font-serif text-3xl text-espresso">Welcome back</h1>
      <p className="mt-2 text-sm text-espresso-soft">
        Sign in to book treatments and track your glow.
      </p>

      <form action={action} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <input name="email" type="email" required placeholder="you@email.com" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <input name="password" type="password" required placeholder="••••••••" className={inputCls} />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full" size="lg">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-espresso-soft">
        New here?{" "}
        <Link href="/signup" className="font-medium text-champagne-deep hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-line bg-cream/60 p-4 text-xs text-espresso-soft">
        <p className="font-semibold text-espresso">Demo accounts (password: password123)</p>
        <ul className="mt-2 space-y-1">
          <li>member@glow.app — Signature member</li>
          <li>partner@glow.app — venue partner portal</li>
          <li>admin@glow.app — operations dashboard</li>
        </ul>
      </div>
    </div>
  );
}
