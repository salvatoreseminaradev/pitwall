import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { AVAILABLE_SEASONS, CURRENT_SEASON } from "@/lib/seasons";
import { refreshSeason } from "@/lib/openf1";
import { isStandingsPersistenceConfigured } from "@/lib/standings-store";

export const dynamic = "force-dynamic";
// Aggregating a season can take a while on a cold OpenF1 cache.
export const maxDuration = 60;

/**
 * Refreshes persisted standings from OpenF1 into Supabase.
 *
 * Protect it with a CRON_SECRET and call it on a schedule (e.g. Vercel Cron).
 *   - no params → refresh the current season only (cheap; what the cron hits)
 *   - `?all=1`  → refresh every available season (run once to seed history)
 *   - `?year=N` → refresh a single season
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this
 * automatically when the CRON_SECRET env var is set).
 */
async function handler(request: NextRequest) {
  if (!isStandingsPersistenceConfigured) {
    return NextResponse.json(
      { error: "Standings persistence is not configured." },
      { status: 503 },
    );
  }

  const secret = process.env.CRON_SECRET ?? "";
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const yearParam = params.get("year");
  const years = yearParam
    ? [Number(yearParam)]
    : params.get("all") === "1"
      ? [...AVAILABLE_SEASONS]
      : [CURRENT_SEASON];

  const results: Record<string, string> = {};
  for (const year of years) {
    try {
      const data = await refreshSeason(year);
      // Bust the in-memory cache so the next read serves the fresh row.
      revalidateTag(`season-${year}`);
      results[year] =
        `ok — ${data.standings.length} drivers, ${data.races.length} races`;
    } catch {
      results[year] = "error";
    }
  }

  return NextResponse.json({ refreshed: results });
}

// Support GET (schedulers like Vercel Cron send GET) and POST (manual seeding).
export const GET = handler;
export const POST = handler;
