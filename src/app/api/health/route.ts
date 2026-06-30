import { NextResponse } from "next/server";

// Lightweight health endpoint for Railway's healthcheck.
// Intentionally does NOT touch the database or auth, so "is the server up?"
// is decoupled from "is everything configured?". Always fast, always 200.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok" });
}
