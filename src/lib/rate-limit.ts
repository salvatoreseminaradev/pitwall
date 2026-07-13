/**
 * Small, dependency-free rate limiter.
 *
 * - If Upstash Redis REST is configured (UPSTASH_REDIS_REST_URL/TOKEN), uses it
 *   so the limit is shared across serverless instances (atomic INCR+EXPIRE via
 *   a tiny Lua script over the REST API — no SDK needed).
 * - Otherwise falls back to an in-memory fixed-window counter (per-instance;
 *   still stops a single client hammering a warm instance).
 * - Fails OPEN: if the limiter itself errors, the request is allowed so a
 *   limiter outage never blocks legitimate checkouts.
 *
 * Server-only.
 */

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetSec: number;
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL ?? "";
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

export const isDistributedRateLimitConfigured = Boolean(
  upstashUrl && upstashToken,
);

// INCR the key; set the expiry only on the first hit so the window is fixed.
const INCR_SCRIPT =
  "local c = redis.call('INCR', KEYS[1]) " +
  "if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return c";

async function upstashLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const res = await fetch(upstashUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${upstashToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["EVAL", INCR_SCRIPT, "1", `rl:${key}`, String(windowSec)]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash responded ${res.status}`);
  const json = (await res.json()) as { result?: number };
  const count = Number(json.result ?? 0);
  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
    resetSec: windowSec,
  };
}

// ---- In-memory fallback (fixed window) ------------------------------------
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }

  return {
    ok: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetSec: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

export async function rateLimit(
  key: string,
  opts: { limit: number; windowSec: number },
): Promise<RateLimitResult> {
  const { limit, windowSec } = opts;
  if (isDistributedRateLimitConfigured) {
    try {
      return await upstashLimit(key, limit, windowSec);
    } catch (err) {
      console.warn("[rate-limit] limiter error — allowing request", err);
      return { ok: true, remaining: limit, resetSec: windowSec };
    }
  }
  return memoryLimit(key, limit, windowSec * 1000);
}
