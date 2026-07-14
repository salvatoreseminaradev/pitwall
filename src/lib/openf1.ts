import { cache } from "react";
import { unstable_cache } from "next/cache";
import { mapLimit, sleep } from "@/lib/utils";
import { CURRENT_SEASON } from "@/lib/seasons";
import {
  isStandingsPersistenceConfigured,
  readSeasonCache,
  writeSeasonCache,
} from "@/lib/standings-store";
import type {
  ApiDriver,
  DriverStanding,
  Lap,
  Meeting,
  Race,
  RaceDetail,
  SeasonData,
  Session,
  SessionResult,
} from "@/types";

const BASE = "https://api.openf1.org/v1";

// Re-exported so server components can grab the season constant alongside the
// data helpers. Client components should import from "@/lib/seasons" directly.
export { CURRENT_SEASON };

/**
 * Thin OpenF1 fetch wrapper.
 * - Server-side only (used from server components / server actions).
 * - Cached by Next.js for an hour; OpenF1 data for past seasons is static, so
 *   a whole season is fetched at most once per hour regardless of traffic.
 * - Retries with backoff on 429 (OpenF1 rate-limits request bursts).
 * - OpenF1 answers "no results" with a non-array body — we normalize to [].
 */
const MAX_RETRIES = 5;

async function api<T>(path: string, attempt = 0): Promise<T[]> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/json" },
  });

  // OpenF1 rate-limits bursts. Back off patiently (honoring Retry-After when
  // present) so the aggregation completes rather than tripping the incomplete
  // guard. Sequential fetching (concurrency 1) keeps bursts — and 429s — rare;
  // the function's maxDuration gives these retries room to finish.
  if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
    const retryAfter = Number(res.headers.get("retry-after"));
    const backoff = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 6000)
      : Math.min(6000, 700 * 2 ** attempt);
    await sleep(backoff + Math.random() * 300);
    return api<T>(path, attempt + 1);
  }

  if (!res.ok) {
    throw new Error(`OpenF1 request failed (${res.status}) for ${path}`);
  }

  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as T[]) : [];
}

// ---------------------------------------------------------------------------
// Raw endpoints
// ---------------------------------------------------------------------------

function getMeetings(year: number) {
  return api<Meeting>(`/meetings?year=${year}`);
}

function getRaceSessions(year: number) {
  return api<Session>(`/sessions?year=${year}&session_type=Race`);
}

function getSessionResult(sessionKey: number) {
  return api<SessionResult>(`/session_result?session_key=${sessionKey}`);
}

function getSessionDrivers(sessionKey: number) {
  return api<ApiDriver>(`/drivers?session_key=${sessionKey}`);
}

export function getLaps(sessionKey: number, driverNumber: number) {
  return api<Lap>(
    `/laps?session_key=${sessionKey}&driver_number=${driverNumber}`,
  );
}

/** Pick up to `count` items spread evenly across the list (always incl. last). */
function sampleEvenly<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const step = (items.length - 1) / (count - 1);
  const picked = new Set<number>();
  for (let i = 0; i < count; i++) picked.add(Math.round(i * step));
  return [...picked].sort((a, b) => a - b).map((i) => items[i]);
}

// ---------------------------------------------------------------------------
// Season aggregation
// ---------------------------------------------------------------------------

/**
 * Build the full season picture (races + championship standings) from OpenF1.
 *
 * OpenF1 has no "standings" endpoint, so we aggregate race results ourselves:
 *  1. list the Grand Prix race sessions,
 *  2. fan out one `session_result` + one `drivers` request per race,
 *  3. sum points / wins / podiums per driver and record points-per-race.
 *
 * The raw aggregation. Cached across requests by `getSeason` below.
 */
const loadSeason = async (year: number): Promise<SeasonData> => {
  const [meetings, sessions] = await Promise.all([
    getMeetings(year),
    getRaceSessions(year),
  ]);

  const meetingByKey = new Map(meetings.map((m) => [m.meeting_key, m]));

  // Grand Prix races are the rounds / calendar; sprint sessions award extra
  // championship points on some weekends. Both are session_type "Race" in
  // OpenF1, told apart by session_name.
  const bySession = (name: string) =>
    sessions
      .filter((s) => s.session_name === name && !s.is_cancelled)
      .sort(
        (a, b) =>
          new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
      );
  const raceSessions = bySession("Race");
  const sprintSessions = bySession("Sprint");

  // Sessions that have already happened. For an in-progress season the
  // remaining rounds have no results yet, so we skip those network calls.
  const now = Date.now();
  const hasHappened = (s: Session) => new Date(s.date_start).getTime() <= now;
  const pastRaceSessions = raceSessions.filter(hasHappened);

  // Driver metadata (name, team, headshot) barely changes across a season, so
  // we sample a handful of *completed* sessions instead of fetching drivers for
  // every race — keeping the request count (and rate-limit pressure) low.
  const sampleSessions = sampleEvenly(
    pastRaceSessions.length > 0 ? pastRaceSessions : raceSessions,
    5,
  );

  // Driver-metadata failures are cosmetic (names fall back to numbers), so we
  // tolerate them. Result failures are NOT: a failed fetch for a past session
  // (as opposed to a genuinely empty result) would make the championship totals
  // wrong, so we track them and refuse to cache incomplete standings.
  const safe = <T>(p: Promise<T[]>): Promise<T[]> => p.catch(() => []);
  const tryFetch = <T>(p: Promise<T[]>): Promise<T[] | null> =>
    p.then((v) => v).catch(() => null);
  const resultsFor = (s: Session): Promise<SessionResult[] | null> =>
    hasHappened(s)
      ? tryFetch(getSessionResult(s.session_key))
      : Promise.resolve([]);

  // Low concurrency keeps us under OpenF1's rate limit (important on serverless,
  // where cold invocations re-aggregate). This path mainly runs during the
  // Supabase seed/cron refresh, which has a generous time budget.
  const resultsPerRace = await mapLimit(raceSessions, 1, resultsFor);
  const resultsPerSprint = await mapLimit(sprintSessions, 1, resultsFor);
  const driverSamples = await mapLimit(sampleSessions, 1, (s) =>
    safe(getSessionDrivers(s.session_key)),
  );

  // If any past session's results failed to load, bail — better a retry than
  // caching a wrong classifica. Successful fetches are cached, so each retry
  // does fewer calls and converges to a complete, correct result.
  const anyFailed =
    resultsPerRace.some((r, i) => r === null && hasHappened(raceSessions[i])) ||
    resultsPerSprint.some(
      (r, i) => r === null && hasHappened(sprintSessions[i]),
    );
  if (anyFailed) {
    throw new Error(
      `Incomplete ${year} results from OpenF1 (rate-limited) — not caching.`,
    );
  }

  // Driver metadata map (prefer entries that actually carry a headshot).
  const driverMeta = new Map<number, ApiDriver>();
  for (const list of driverSamples) {
    for (const d of list) {
      const existing = driverMeta.get(d.driver_number);
      if (!existing || (!existing.headshot_url && d.headshot_url)) {
        driverMeta.set(d.driver_number, d);
      }
    }
  }

  // Round labels + meeting→round index for completed rounds (chart X-axis).
  const roundLabels = pastRaceSessions.map(
    (s) =>
      meetingByKey.get(s.meeting_key)?.circuit_short_name ??
      s.circuit_short_name,
  );
  const roundIndexByMeeting = new Map(
    pastRaceSessions.map((s, i) => [s.meeting_key, i] as const),
  );

  const standings = new Map<number, DriverStanding>();
  const ensureEntry = (driverNumber: number): DriverStanding => {
    let entry = standings.get(driverNumber);
    if (!entry) {
      const meta = driverMeta.get(driverNumber);
      entry = {
        driverNumber,
        fullName: meta?.full_name ?? `#${driverNumber}`,
        acronym: meta?.name_acronym ?? String(driverNumber),
        team: meta?.team_name ?? "—",
        teamColour: meta?.team_colour ?? "888888",
        headshot: meta?.headshot_url ?? "",
        country: meta?.country_code ?? "",
        firstName: meta?.first_name ?? "",
        lastName: meta?.last_name ?? "",
        points: 0,
        wins: 0,
        podiums: 0,
        bestFinish: Number.POSITIVE_INFINITY,
        pointsByRace: roundLabels.map((round) => ({ round, points: 0 })),
      };
      standings.set(driverNumber, entry);
    }
    return entry;
  };

  // Grand Prix results → points + wins / podiums / best finish.
  raceSessions.forEach((session, index) => {
    const roundIdx = roundIndexByMeeting.get(session.meeting_key);
    for (const r of resultsPerRace[index] ?? []) {
      const entry = ensureEntry(r.driver_number);
      const pts = r.points ?? 0;
      entry.points += pts;
      if (roundIdx != null) entry.pointsByRace[roundIdx].points += pts;
      if (r.position === 1) entry.wins += 1;
      if (r.position != null && r.position <= 3) entry.podiums += 1;
      if (r.position != null && r.position < entry.bestFinish) {
        entry.bestFinish = r.position;
      }
    }
  });

  // Sprint results → extra points only, merged into that weekend's GP round.
  // (Sprint wins aren't counted as Grand Prix wins.)
  sprintSessions.forEach((session, index) => {
    const roundIdx = roundIndexByMeeting.get(session.meeting_key);
    for (const r of resultsPerSprint[index] ?? []) {
      const entry = ensureEntry(r.driver_number);
      const pts = r.points ?? 0;
      entry.points += pts;
      if (roundIdx != null) entry.pointsByRace[roundIdx].points += pts;
    }
  });

  // Full calendar (past + future), with the GP winner where known.
  const races: Race[] = raceSessions.map((session, index) => {
    const meeting = meetingByKey.get(session.meeting_key);
    const winner = (resultsPerRace[index] ?? []).find((r) => r.position === 1);
    const winnerMeta = winner ? driverMeta.get(winner.driver_number) : undefined;
    return {
      sessionKey: session.session_key,
      meetingKey: session.meeting_key,
      round: index + 1,
      name: meeting?.meeting_name ?? `${session.country_name} Grand Prix`,
      circuit: meeting?.circuit_short_name ?? session.circuit_short_name,
      country: session.country_name,
      countryCode: session.country_code,
      countryFlag: meeting?.country_flag ?? "",
      date: session.date_start,
      winner: winnerMeta?.full_name ?? null,
      winnerTeam: winnerMeta?.team_name ?? null,
    } satisfies Race;
  });

  const sortedStandings = [...standings.values()]
    .map((s) => ({
      ...s,
      bestFinish: Number.isFinite(s.bestFinish) ? s.bestFinish : 0,
    }))
    .sort((a, b) => b.points - a.points || b.wins - a.wins);

  return { year, races, standings: sortedStandings };
};

/** Aggregate the season from OpenF1 and persist it to Supabase. */
export async function refreshSeason(year: number): Promise<SeasonData> {
  const data = await loadSeason(year);
  await writeSeasonCache(year, data);
  return data;
}

// How long a stored current-season row is considered fresh before we kick off
// a background refresh. Past seasons never go stale.
const STALE_MS = 30 * 60 * 1000;

/**
 * Resolve a season, preferring the Supabase-persisted copy.
 *
 * - Persisted row present → return it instantly. If it's the current season and
 *   older than STALE_MS, trigger a non-blocking background refresh.
 * - No row (or persistence not configured) → aggregate from OpenF1 (and store
 *   it when persistence is on).
 */
async function resolveSeason(year: number): Promise<SeasonData> {
  if (!isStandingsPersistenceConfigured) return loadSeason(year);

  const cached = await readSeasonCache(year);
  if (cached) {
    const isStale =
      year >= CURRENT_SEASON &&
      Date.now() - new Date(cached.updatedAt).getTime() > STALE_MS;
    if (isStale) void refreshSeason(year).catch(() => {});
    return cached.data;
  }

  return refreshSeason(year);
}

/**
 * Cache the fully-aggregated season across requests. Layers, fastest first:
 *   React cache (per render) → unstable_cache (in-memory, per-server) →
 *   Supabase (persistent, survives restarts/deploys) → OpenF1 (source).
 *
 * Past seasons never change, so they're cached for a week; the current season
 * refreshes every 30 minutes.
 */
const seasonLoaders = new Map<number, () => Promise<SeasonData>>();

function seasonLoader(year: number): () => Promise<SeasonData> {
  let loader = seasonLoaders.get(year);
  if (!loader) {
    const revalidate = year < CURRENT_SEASON ? 60 * 60 * 24 * 7 : 60 * 30;
    loader = unstable_cache(
      () => resolveSeason(year),
      ["season", String(year)],
      { revalidate, tags: [`season-${year}`] },
    );
    seasonLoaders.set(year, loader);
  }
  return loader;
}

// React `cache` on top dedups within a single render.
export const getSeason = cache((year: number) => seasonLoader(year)());

export async function getStandings(year: number): Promise<DriverStanding[]> {
  return (await getSeason(year)).standings;
}

export async function getRaces(year: number): Promise<Race[]> {
  return (await getSeason(year)).races;
}

/** Earliest race whose start is still in the future, or null if none remain. */
export async function getNextRace(year: number): Promise<Race | null> {
  const { races } = await getSeason(year);
  const now = Date.now();
  const upcoming = races
    .filter((r) => new Date(r.date).getTime() > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return upcoming[0] ?? null;
}

export async function getDriver(
  year: number,
  driverNumber: number,
): Promise<DriverStanding | undefined> {
  const { standings } = await getSeason(year);
  return standings.find((s) => s.driverNumber === driverNumber);
}

/**
 * Race classification + lap-time traces for the top finishers.
 * Fetching every driver's laps would be huge, so we chart only the podium.
 *
 * Wrapped in React `cache` so `generateMetadata` and the page render share a
 * single computation instead of each re-fetching from OpenF1.
 */
export const getRaceDetail = cache(async (
  year: number,
  sessionKey: number,
): Promise<RaceDetail | null> => {
  const { races } = await getSeason(year);
  const race = races.find((r) => r.sessionKey === sessionKey);
  if (!race) return null;

  // Degrade gracefully on rate limits rather than throwing the whole page;
  // failed fetches aren't cached, so a reload fills any gaps.
  const safe = <T>(p: Promise<T[]>): Promise<T[]> => p.catch(() => []);

  const [results, drivers] = await Promise.all([
    safe(getSessionResult(sessionKey)),
    safe(getSessionDrivers(sessionKey)),
  ]);

  const driverByNumber = new Map(drivers.map((d) => [d.driver_number, d]));

  const sessionDrivers = drivers
    .map((d) => ({
      driverNumber: d.driver_number,
      acronym: d.name_acronym,
      fullName: d.full_name,
      teamColour: d.team_colour,
      headshot: d.headshot_url,
    }))
    .sort((a, b) => a.acronym.localeCompare(b.acronym));

  const classification = [...results]
    .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
    .map((r) => {
      const meta = driverByNumber.get(r.driver_number);
      return {
        position: r.position,
        driverNumber: r.driver_number,
        name: meta?.full_name ?? `#${r.driver_number}`,
        acronym: meta?.name_acronym ?? String(r.driver_number),
        team: meta?.team_name ?? "—",
        teamColour: meta?.team_colour ?? "888888",
        points: r.points ?? 0,
        gap: r.gap_to_leader ?? null,
        dnf: Boolean(r.dnf || r.dns || r.dsq),
      };
    });

  // Lap traces for the top 3 finishers.
  const podium = classification.filter((c) => c.position && c.position <= 3);
  const lapTraces = await mapLimit(podium, 3, async (driver) => {
    const laps = await safe(getLaps(sessionKey, driver.driverNumber));
    return {
      driverNumber: driver.driverNumber,
      acronym: driver.acronym,
      teamColour: driver.teamColour,
      laps: laps
        .filter((l) => l.lap_duration != null)
        .map((l) => ({ lap: l.lap_number, duration: l.lap_duration as number })),
    };
  });

  return { race, classification, lapTraces, drivers: sessionDrivers };
});
