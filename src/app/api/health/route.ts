import { NextResponse } from "next/server";
import { AVAILABLE_SEASONS, CURRENT_SEASON } from "@/lib/seasons";
import {
  getStoreHealth,
  isStandingsPersistenceConfigured,
} from "@/lib/standings-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

/**
 * Public health check. Reports config + Supabase reachability and the age of
 * each persisted season. Returns 200 when healthy, 503 when degraded — handy
 * to point an uptime monitor at.
 *
 * No secrets are exposed: only booleans, season years and cache timestamps.
 */
export async function GET() {
  const store = await getStoreHealth();
  const byYear = new Map(store.seasons.map((s) => [s.year, s.updatedAt]));
  const now = Date.now();

  const seasons = AVAILABLE_SEASONS.map((year) => {
    const updatedAt = byYear.get(year) ?? null;
    return {
      year,
      current: year === CURRENT_SEASON,
      cached: updatedAt != null,
      updatedAt,
      ageMinutes: updatedAt
        ? Math.round((now - Date.parse(updatedAt)) / 60000)
        : null,
    };
  });

  const currentCached = seasons.find((s) => s.current)?.cached ?? false;

  // With persistence off the app is healthy in fallback (OpenF1) mode. With it
  // on, we expect the DB reachable and the current season seeded.
  const healthy = isStandingsPersistenceConfigured
    ? store.reachable && currentCached
    : true;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      time: new Date().toISOString(),
      checks: {
        supabase: { configured: isSupabaseConfigured },
        standingsPersistence: {
          configured: isStandingsPersistenceConfigured,
          reachable: store.reachable,
        },
      },
      seasons,
    },
    { status: healthy ? 200 : 503 },
  );
}
