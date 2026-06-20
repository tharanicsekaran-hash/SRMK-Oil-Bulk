import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorizedCron(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

/** Lightweight DB ping so Supabase free-tier projects stay active (pauses after ~7 days idle). */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const startedAt = Date.now();
    await prisma.$queryRaw`SELECT 1 as keep_alive`;
    const durationMs = Date.now() - startedAt;

    return NextResponse.json({
      ok: true,
      purpose: "supabase-keep-alive",
      timestamp: new Date().toISOString(),
      durationMs,
    });
  } catch (error) {
    console.error("Keep-alive cron failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Database ping failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
