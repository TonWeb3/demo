"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Button } from "@/components/ui";

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

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-champagne";

export default function ProfileForm({
  action,
  defaults,
}: {
  action: (formData: FormData) => void;
  defaults: { name: string; city: string; budget: string; goals: string[] };
}) {
  const [goals, setGoals] = useState<string[]>(defaults.goals);
  const [budget, setBudget] = useState(defaults.budget);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-line bg-white p-5">
      <h2 className="font-serif text-xl text-espresso">Beauty profile</h2>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Name</label>
        <input name="name" defaultValue={defaults.name} className={inputCls} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">City</label>
        <select name="city" defaultValue={defaults.city} className={inputCls}>
          <option>Dubai</option>
          <option>Abu Dhabi</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Goals</label>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => setGoals((p) => (p.includes(g) ? p.filter((x) => x !== g) : [...p, g]))}
              className={clsx(
                "rounded-full border px-3 py-1.5 text-xs transition",
                goals.includes(g) ? "border-champagne bg-champagne/20 text-champagne-deep" : "border-line text-espresso-soft",
              )}
            >
              {g}
            </button>
          ))}
        </div>
        {goals.map((g) => <input key={g} type="hidden" name="goals" value={g} />)}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Budget</label>
        <div className="flex gap-2">
          {BUDGETS.map((b) => (
            <button
              type="button"
              key={b.key}
              onClick={() => setBudget(b.key)}
              className={clsx(
                "flex-1 rounded-xl border px-3 py-2 text-xs transition",
                budget === b.key ? "border-champagne bg-champagne/20 text-champagne-deep" : "border-line text-espresso-soft",
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="budget" value={budget} />
      </div>

      <Button type="submit" className="w-full">Save preferences</Button>
    </form>
  );
}
