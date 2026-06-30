"use client";

import { useActionState } from "react";
import { Button } from "./ui";
import { submitLead, type LeadState } from "@/app/(marketing)/lead-actions";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-champagne focus:ring-2 focus:ring-champagne/30";

export default function LeadForm({ kind }: { kind: "partner" | "corporate" }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, undefined);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-sage/40 bg-sage/10 p-8 text-center">
        <p className="text-3xl">✦</p>
        <h3 className="mt-3 font-serif text-xl text-espresso">Thank you — we&apos;ll be in touch.</h3>
        <p className="mt-2 text-sm text-espresso-soft">
          Our {kind === "partner" ? "partnerships" : "corporate"} team will reach out within 2 business days.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="kind" value={kind} />
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Your name" className={inputCls} />
        <input
          name="org"
          required
          placeholder={kind === "partner" ? "Venue name" : "Company name"}
          className={inputCls}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="email" type="email" required placeholder="Work email" className={inputCls} />
        <input name="phone" placeholder="Phone (optional)" className={inputCls} />
      </div>
      <textarea
        name="message"
        rows={3}
        placeholder={kind === "partner" ? "Tell us about your venue" : "How many employees?"}
        className={inputCls}
      />
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
        {pending ? "Sending…" : kind === "partner" ? "Request partner info" : "Talk to our team"}
      </Button>
    </form>
  );
}
