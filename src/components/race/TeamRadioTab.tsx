"use client";

import { useMemo, useState } from "react";
import type { SessionDriver, TeamRadioRow } from "@/types";
import { useOpenF1 } from "@/lib/openf1-client";
import { TabError, TabLoading, TabEmpty } from "./TabState";

/** Format seconds-from-race-start as ±M:SS. */
function raceClock(deltaMs: number): string {
  const sign = deltaMs < 0 ? "-" : "+";
  const total = Math.floor(Math.abs(deltaMs) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${sign}${m}:${String(s).padStart(2, "0")}`;
}

export default function TeamRadioTab({
  sessionKey,
  raceDate,
  drivers,
}: {
  sessionKey: number;
  raceDate: string;
  drivers: SessionDriver[];
}) {
  const { data, loading, error, reload } = useOpenF1<TeamRadioRow>(
    `/team_radio?session_key=${sessionKey}`,
  );
  const [newestFirst, setNewestFirst] = useState(true);

  const driverMap = useMemo(
    () => new Map(drivers.map((d) => [d.driverNumber, d])),
    [drivers],
  );
  const raceStart = useMemo(() => Date.parse(raceDate), [raceDate]);

  const items = useMemo(() => {
    const sorted = [...(data ?? [])].sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date),
    );
    return newestFirst ? sorted.reverse() : sorted;
  }, [data, newestFirst]);

  if (loading) return <TabLoading label="Loading team radio…" />;
  if (error) return <TabError onRetry={reload} />;
  if (items.length === 0)
    return <TabEmpty message="No team radio for this session." />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-neutral-400">{items.length} messages</p>
        <button
          type="button"
          onClick={() => setNewestFirst((v) => !v)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-f1/50 hover:text-white"
        >
          {newestFirst ? "↓ Newest first" : "↑ Oldest first"}
        </button>
      </div>

      <ul className="overflow-hidden rounded-xl border border-border">
        {items.map((msg, i) => {
          const meta = driverMap.get(msg.driver_number);
          const delta = Date.parse(msg.date) - raceStart;
          return (
            <li
              key={`${msg.driver_number}-${msg.date}`}
              className={`flex flex-col gap-3 border-b border-border p-4 last:border-0 sm:flex-row sm:items-center ${
                i % 2 === 0 ? "bg-surface" : "bg-background"
              }`}
            >
              <div className="flex items-center gap-3 sm:w-44 sm:shrink-0">
                {meta?.headshot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={meta.headshot}
                    alt={meta.fullName}
                    loading="lazy"
                    className="h-10 w-10 rounded-full bg-background object-cover ring-1 ring-border"
                  />
                ) : (
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{
                      backgroundColor: meta?.teamColour
                        ? `#${meta.teamColour}`
                        : "#333",
                    }}
                  >
                    {meta?.acronym ?? msg.driver_number}
                  </span>
                )}
                <div>
                  <p className="font-semibold text-white">
                    {meta?.acronym ?? `#${msg.driver_number}`}
                  </p>
                  <p className="font-mono text-xs text-neutral-500">
                    {raceClock(delta)}
                  </p>
                </div>
              </div>

              <audio
                controls
                preload="none"
                src={msg.recording_url}
                className="h-9 w-full sm:flex-1"
              >
                Your browser doesn&apos;t support audio playback.
              </audio>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
