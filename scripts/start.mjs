// Production start for Railway.
// Runs `prisma migrate deploy` best-effort (never blocks the server), then
// starts Next. Written as a Node script so there's no fragile shell syntax.
import { spawnSync, spawn } from "node:child_process";

console.log("[start] applying database migrations...");
const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
  timeout: 60_000, // never let a bad/unreachable DATABASE_URL block startup
});
if (migrate.status !== 0) {
  console.warn(
    `[start] WARNING: prisma migrate deploy did not succeed (status ${migrate.status}` +
      `${migrate.signal ? `, signal ${migrate.signal}` : ""}). ` +
      "Is DATABASE_URL set and reachable? Starting the server anyway.",
  );
} else {
  console.log("[start] migrations applied.");
}

console.log("[start] launching Next.js...");
const child = spawn("npx", ["next", "start"], { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
