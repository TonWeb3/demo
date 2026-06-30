"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUp } from "../actions";
import { Button } from "@/components/ui";
import { clsx } from "clsx";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-champagne focus:ring-2 focus:ring-champagne/30";

const GOALS = [
  "Glowing skin",
  "Healthy hair",
  "Perfect nails",
  "Stress & recovery",
  "Anti-ageing",
  "Self-care routine",
  "Men's grooming",
];

const BUDGETS = [
  { key: "mid", label: "Considered" },
  { key: "premium", label: "Premium" },
  { key: "luxury", label: "No limits" },
];

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUp, undefined);
  const [goals, setGoals] = useState<string[]>([]);
  const [budget, setBudget] = useState("premium");

  function toggleGoal(g: string) {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-espresso">Begin your glow</h1>
      <p className="mt-2 text-sm text-espresso-soft">
        Tell us a little so we can personalise your recommendations.
      </p>

      <form action={action} className="mt-7 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Full name</label>
          <input name="name" required placeholder="Sara Al Noori" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <input name="email" type="email" required placeholder="you@email.com" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <input name="password" type="password" required placeholder="At least 6 characters" className={inputCls} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Your beauty goals</label>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => toggleGoal(g)}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-xs transition",
                  goals.includes(g)
                    ? "border-champagne bg-champagne/20 text-champagne-deep"
                    : "border-line text-espresso-soft hover:border-champagne",
                )}
              >
                {g}
              </button>
            ))}
          </div>
          {goals.map((g) => (
            <input key={g} type="hidden" name="goals" value={g} />
          ))}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Monthly budget</label>
          <div className="flex gap-2">
            {BUDGETS.map((b) => (
              <button
                type="button"
                key={b.key}
                onClick={() => setBudget(b.key)}
                className={clsx(
                  "flex-1 rounded-xl border px-3 py-2 text-xs transition",
                  budget === b.key
                    ? "border-champagne bg-champagne/20 text-champagne-deep"
                    : "border-line text-espresso-soft hover:border-champagne",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="budget" value={budget} />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full" size="lg">
          {pending ? "Creating your account…" : "Create account & choose plan"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-espresso-soft">
        Already a member?{" "}
        <Link href="/login" className="font-medium text-champagne-deep hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
