"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { REVIEW_TAGS } from "@/lib/constants";
import { Button } from "@/components/ui";

const SUB = [
  { key: "cleanliness", label: "Cleanliness" },
  { key: "therapist", label: "Therapist" },
  { key: "result", label: "Result" },
  { key: "ambience", label: "Ambience" },
  { key: "value", label: "Value" },
];

function StarPick({ name, value, onChange }: { name: string; value: number; onChange: (v: number) => void }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          type="button"
          key={i}
          onClick={() => onChange(i)}
          className={clsx("text-lg", i <= value ? "text-champagne" : "text-line")}
        >
          ★
        </button>
      ))}
      <input type="hidden" name={name} value={value} />
    </span>
  );
}

export default function ReviewForm({
  bookingId,
  action,
}: {
  bookingId: string;
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [sub, setSub] = useState<Record<string, number>>(
    Object.fromEntries(SUB.map((s) => [s.key, 5])),
  );
  const [tags, setTags] = useState<string[]>([]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-full bg-espresso py-2 text-sm font-medium text-cream"
      >
        Leave a review
      </button>
    );
  }

  return (
    <form action={action} className="mt-3 space-y-4 rounded-2xl bg-cream p-4">
      <input type="hidden" name="bookingId" value={bookingId} />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-espresso">Overall</span>
        <StarPick name="rating" value={rating} onChange={setRating} />
      </div>

      <div className="space-y-2">
        {SUB.map((s) => (
          <div key={s.key} className="flex items-center justify-between">
            <span className="text-sm text-espresso-soft">{s.label}</span>
            <StarPick
              name={s.key}
              value={sub[s.key]}
              onChange={(v) => setSub((p) => ({ ...p, [s.key]: v }))}
            />
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-sm text-espresso-soft">Quick tags</p>
        <div className="flex flex-wrap gap-1.5">
          {REVIEW_TAGS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}
              className={clsx(
                "rounded-full border px-2.5 py-1 text-xs transition",
                tags.includes(t) ? "border-champagne bg-champagne/20 text-champagne-deep" : "border-line bg-white text-espresso-soft",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {tags.map((t) => <input key={t} type="hidden" name="tags" value={t} />)}
      </div>

      <textarea
        name="notes"
        rows={2}
        placeholder="Anything to add? (optional)"
        className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-champagne"
      />

      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-line py-2 text-sm text-espresso-soft">
          Cancel
        </button>
        <Button type="submit" className="flex-1">Submit review</Button>
      </div>
    </form>
  );
}
