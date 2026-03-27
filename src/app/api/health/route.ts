/**
 * GET /api/health
 * Liveness / readiness for uptime monitors (e.g. Vercel Cron or external pings).
 */
import { NextResponse } from "next/server";

import { getDB } from "@/lib/mongodb";

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const db = await getDB();
    await db.command({ ping: 1 });
    return NextResponse.json({
      status: "ok",
      timestamp,
      database: "connected",
    });
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp,
        database: "unavailable",
      },
      { status: 503 },
    );
  }
}
