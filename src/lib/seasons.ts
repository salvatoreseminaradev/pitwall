/**
 * Season configuration. Client-safe (no server-only imports) so both
 * server components and client components (e.g. the season selector) can use it.
 */

// Seasons OpenF1 has data for, newest first. The first entry is the current
// season (FREE default); the rest are unlocked as history for PRO users.
export const AVAILABLE_SEASONS = [2026, 2025, 2024, 2023] as const;

export type Season = (typeof AVAILABLE_SEASONS)[number];

/** The season FREE users see. Everything defaults here. */
export const CURRENT_SEASON: Season = AVAILABLE_SEASONS[0];

function isKnownSeason(year: number): year is Season {
  return (AVAILABLE_SEASONS as readonly number[]).includes(year);
}

/**
 * Resolve a requested `?season=` value against the user's tier.
 * FREE users are always pinned to the current season; PRO users may pick any
 * available season. Unknown/invalid values fall back to the current season.
 */
export function resolveSeason(
  requested: string | undefined,
  isPro: boolean,
): Season {
  const year = Number(requested);
  if (isPro && Number.isFinite(year) && isKnownSeason(year)) return year;
  return CURRENT_SEASON;
}

/** Build a link that carries the season only when it isn't the current one. */
export function seasonHref(base: string, season: number): string {
  return season === CURRENT_SEASON ? base : `${base}?season=${season}`;
}
