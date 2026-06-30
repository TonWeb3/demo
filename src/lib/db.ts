import { PrismaClient } from "@prisma/client";

// Zero-config default: if no DATABASE_URL is provided (e.g. a fresh Railway
// deploy with no database wired up), fall back to a local SQLite file so the
// app still runs. Set DATABASE_URL to override (e.g. a managed Postgres).
process.env.DATABASE_URL ||= "file:./prod.db";

// Reuse a single PrismaClient across hot-reloads in dev to avoid exhausting
// the SQLite connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
