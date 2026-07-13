"use client";

import { useEffect, useState } from "react";

/**
 * Browser-side OpenF1 access. OpenF1 sends `Access-Control-Allow-Origin: *`,
 * so the interactive race tabs fetch it directly (no proxy needed).
 */
export const OPENF1 = "https://api.openf1.org/v1";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** GET a list endpoint, retrying briefly on 429. Non-array bodies → []. */
export async function f1Get<T>(
  path: string,
  signal?: AbortSignal,
  attempt = 0,
): Promise<T[]> {
  const res = await fetch(`${OPENF1}${path}`, { signal });

  if (res.status === 429 && attempt < 3) {
    await sleep(700 * (attempt + 1));
    return f1Get<T>(path, signal, attempt + 1);
  }
  if (!res.ok) throw new Error(`OpenF1 request failed (${res.status})`);

  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as T[]) : [];
}

/** Build a `date>=start & date<=end` filter for time-windowed endpoints. */
export function dateWindow(start: string, end: string): string {
  return `&date%3E=${encodeURIComponent(start)}&date%3C=${encodeURIComponent(end)}`;
}

export interface FetchState<T> {
  data: T[] | null;
  loading: boolean;
  error: boolean;
  reload: () => void;
}

/**
 * Fetch an OpenF1 endpoint when `path` changes. Pass `null` to stay idle
 * (used by the telemetry tab before the user has made a selection).
 */
export function useOpenF1<T>(path: string | null): FetchState<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(path));
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      setError(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(false);

    f1Get<T>(path, controller.signal)
      .then((rows) => {
        setData(rows);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if ((err as Error)?.name === "AbortError") return;
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [path, nonce]);

  return { data, loading, error, reload: () => setNonce((n) => n + 1) };
}
