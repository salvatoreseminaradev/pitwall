export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Format a lap/sector duration (seconds, float) as m:ss.mmm — e.g. 84.964 → "1:24.964". */
export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds - mins * 60;
  const secsStr = secs.toFixed(3).padStart(6, "0");
  return mins > 0 ? `${mins}:${secsStr}` : secsStr;
}

/** Format a gap-to-leader (seconds) as "+s.mmm", or "—" when unavailable. */
export function formatGap(gap: number | string | null | undefined): string {
  if (gap == null || gap === "") return "—";
  if (typeof gap === "string") return gap; // e.g. "+1 LAP"
  return `+${gap.toFixed(3)}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Run `fn` over `items` with a bounded concurrency, preserving order.
 * Used to fan out per-race OpenF1 requests without hammering the API.
 */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    worker,
  );
  await Promise.all(workers);
  return results;
}
