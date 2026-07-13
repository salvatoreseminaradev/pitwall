import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfig } from "@/lib/supabase/config";
import type { SeasonData } from "@/types";

/**
 * Persistence layer for aggregated season standings.
 *
 * The whole `SeasonData` (races + standings) is stored as one JSON row per
 * season in the `season_cache` table, so pages can read it instantly instead
 * of re-aggregating ~30 OpenF1 calls on a cold cache. Writes use the
 * service-role client (server-only), so this must never be imported by client
 * code. Degrades to a no-op when the service-role key isn't configured.
 */

const TABLE = "season_cache";

export const isStandingsPersistenceConfigured =
  supabaseConfig.url.length > 0 &&
  (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").length > 0;

export async function readSeasonCache(
  year: number,
): Promise<{ data: SeasonData; updatedAt: string } | null> {
  if (!isStandingsPersistenceConfigured) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from(TABLE)
      .select("data, updated_at")
      .eq("year", year)
      .maybeSingle();

    if (error || !data) return null;
    return {
      data: data.data as SeasonData,
      updatedAt: data.updated_at as string,
    };
  } catch {
    return null;
  }
}

/**
 * Health probe for the standings store: whether it's configured, whether the
 * DB is reachable, and the `updated_at` of each cached season. Never throws.
 */
export async function getStoreHealth(): Promise<{
  configured: boolean;
  reachable: boolean;
  seasons: { year: number; updatedAt: string }[];
}> {
  if (!isStandingsPersistenceConfigured) {
    return { configured: false, reachable: false, seasons: [] };
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from(TABLE)
      .select("year, updated_at")
      .order("year", { ascending: false });

    if (error) return { configured: true, reachable: false, seasons: [] };
    return {
      configured: true,
      reachable: true,
      seasons: (data ?? []).map((r) => ({
        year: r.year as number,
        updatedAt: r.updated_at as string,
      })),
    };
  } catch {
    return { configured: true, reachable: false, seasons: [] };
  }
}

export async function writeSeasonCache(
  year: number,
  data: SeasonData,
): Promise<void> {
  if (!isStandingsPersistenceConfigured) return;
  try {
    const admin = createAdminClient();
    await admin
      .from(TABLE)
      .upsert(
        { year, data, updated_at: new Date().toISOString() },
        { onConflict: "year" },
      );
  } catch {
    // Best-effort cache write — never block a render on it.
  }
}
