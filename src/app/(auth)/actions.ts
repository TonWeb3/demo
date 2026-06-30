"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

const signupSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  city: z.string().default("Dubai"),
  goals: z.array(z.string()).default([]),
  budget: z.string().default("mid"),
});

export type AuthState = { error?: string } | undefined;

function destFor(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "PARTNER") return "/partner";
  return "/app";
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    city: formData.get("city") || "Dubai",
    goals: formData.getAll("goals").map(String),
    budget: formData.get("budget") || "mid",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }
  const { name, email, password, city, goals, budget } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      city,
      goals: JSON.stringify(goals),
      budget,
      role: "MEMBER",
    },
  });

  await createSession({ uid: user.id, email: user.email, role: "MEMBER", name: user.name });
  // New members land on plan selection to activate their membership.
  redirect("/pricing?welcome=1");
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createSession({
    uid: user.id,
    email: user.email,
    role: user.role as "MEMBER" | "PARTNER" | "ADMIN",
    name: user.name,
  });
  redirect(destFor(user.role));
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
