// Production start for Railway — fully self-contained, zero external config.
// 1. Defaults DATABASE_URL to a local SQLite file if not provided.
// 2. Creates/updates the schema with `prisma db push`.
// 3. Seeds demo data if the database is empty.
// 4. Starts Next.js.
// Written in Node (no fragile shell syntax) and never lets DB setup block boot.
import { spawnSync, spawn } from "node:child_process";

process.env.DATABASE_URL ||= "file:./prod.db";
console.log(`[start] DATABASE_URL = ${process.env.DATABASE_URL}`);

function run(label, cmd, args, timeout = 120_000) {
  console.log(`[start] ${label}...`);
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, timeout });
  if (r.status !== 0) {
    console.warn(`[start] WARNING: ${label} did not succeed (status ${r.status}${r.signal ? `, ${r.signal}` : ""}).`);
  }
  return r.status === 0;
}

// Create the schema (idempotent). For SQLite this just ensures all tables exist.
run("applying schema (prisma db push)", "npx", ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"]);

// Seed demo data. seed.ts skips itself if the database is already populated,
// so runtime data survives restarts within a deploy.
run("seeding demo data", "npx", ["tsx", "prisma/seed.ts"]);

// Start the server (long-running).
console.log("[start] launching Next.js...");
const child = spawn("npx", ["next", "start"], { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
