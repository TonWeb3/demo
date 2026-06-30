"use server";

import { z } from "zod";

export type LeadState = { ok?: boolean; error?: string } | undefined;

const schema = z.object({
  kind: z.string(),
  name: z.string().min(2),
  org: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
});

/**
 * Captures a partner/corporate lead. In production this would write to a CRM
 * or the `Lead` table; here we validate and log it server-side.
 */
export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Please complete the required fields." };
  }
  console.log("📨 New lead:", parsed.data);
  return { ok: true };
}
