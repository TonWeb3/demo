import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE = "glow_session";

// Session signing secret. Set AUTH_SECRET in production for real security; if
// it's missing we fall back to a default (with a warning) so the app still runs
// out of the box. Resolved lazily so `next build` never requires it.
let cachedSecret: Uint8Array | undefined;
function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret && process.env.NODE_ENV === "production") {
    console.warn(
      "[auth] AUTH_SECRET is not set — using an insecure default. Set AUTH_SECRET for production.",
    );
  }
  cachedSecret = new TextEncoder().encode(authSecret ?? "glow-dev-secret-change-me");
  return cachedSecret;
}

export type SessionPayload = {
  uid: string;
  email: string;
  role: "MEMBER" | "PARTNER" | "ADMIN";
  name: string;
};

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Full user record for the current session (with membership + plan). */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.uid },
    include: { membership: { include: { plan: true } } },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: "MEMBER" | "PARTNER" | "ADMIN") {
  const user = await requireUser();
  if (user.role !== role && user.role !== "ADMIN") redirect("/login");
  return user;
}
