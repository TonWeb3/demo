"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Button } from "@/components/ui";

const TIMES = ["10:00", "11:30", "13:00", "15:00", "17:30", "19:00"];
const THERAPISTS = ["No preference", "Senior therapist", "Master therapist"];

function nextDays(n: number) {
  const days = [];
  const base = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function BookingForm({
  serviceId,
  creditCost,
  creditsRemaining,
  action,
}: {
  serviceId: string;
  creditCost: number;
  creditsRemaining: number;
  action: (formData: FormData) => void;
}) {
  const days = nextDays(7);
  const [dayIdx, setDayIdx] = useState(0);
  const [time, setTime] = useState(TIMES[2]);
  const [therapist, setTherapist] = useState(THERAPISTS[0]);

  const selected = days[dayIdx];
  const [h, m] = time.split(":").map(Number);
  const dt = new Date(selected);
  dt.setHours(h, m, 0, 0);

  return (
    <form action={action} className="mt-5 space-y-6">
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="date" value={dt.toISOString()} />
      <input type="hidden" name="therapistPref" value={therapist} />

      <div>
        <p className="mb-2 text-sm font-medium text-espresso">Choose a date</p>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
          {days.map((d, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setDayIdx(i)}
              className={clsx(
                "flex w-14 shrink-0 flex-col items-center rounded-xl border py-2 text-xs transition",
                dayIdx === i ? "border-champagne bg-champagne/20 text-champagne-deep" : "border-line bg-white text-espresso-soft",
              )}
            >
              <span>{d.toLocaleDateString("en", { weekday: "short" })}</span>
              <span className="text-base font-medium text-espresso">{d.getDate()}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-espresso">Choose a time</p>
        <div className="grid grid-cols-3 gap-2">
          {TIMES.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTime(t)}
              className={clsx(
                "rounded-xl border py-2.5 text-sm transition",
                time === t ? "border-champagne bg-champagne/20 text-champagne-deep" : "border-line bg-white text-espresso-soft",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-espresso">Therapist preference</p>
        <div className="space-y-2">
          {THERAPISTS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTherapist(t)}
              className={clsx(
                "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition",
                therapist === t ? "border-champagne bg-champagne/20 text-champagne-deep" : "border-line bg-white text-espresso-soft",
              )}
            >
              {t}
              <span>{therapist === t ? "●" : "○"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-cream p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-espresso-soft">This booking</span>
          <span className="font-medium text-espresso">{creditCost} credits</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-espresso-soft">Credits after booking</span>
          <span className="font-medium text-espresso">{creditsRemaining - creditCost}</span>
        </div>
      </div>

      <p className="text-xs text-espresso-soft">
        Free cancellation up to 24 hours before. Cancel inside the window and your
        credits return automatically.
      </p>

      <Button type="submit" size="lg" className="w-full">
        Confirm booking
      </Button>
    </form>
  );
}
