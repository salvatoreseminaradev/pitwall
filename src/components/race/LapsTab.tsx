"use client";

import { useMemo, useState } from "react";
import type { Lap, SessionDriver } from "@/types";
import { useOpenF1 } from "@/lib/openf1-client";
import { formatLapTime } from "@/lib/utils";
import { TabError, TabLoading, TabEmpty } from "./TabState";

type SortKey = "driver" | "time" | "gap";
type SortDir = "asc" | "desc";

interface BestLapRow {
  driverNumber: number;
  acronym: string;
  teamColour: string;
  bestTime: number;
  bestLapNumber: number;
  gap: number;
}

export default function LapsTab({
  sessionKey,
  drivers,
}: {
  sessionKey: number;
  drivers: SessionDriver[];
}) {
  const { data, loading, error, reload } = useOpenF1<Lap>(
    `/laps?session_key=${sessionKey}`,
  );
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const driverMap = useMemo(
    () => new Map(drivers.map((d) => [d.driverNumber, d])),
    [drivers],
  );

  // Reduce every lap into each driver's fastest lap.
  const rows = useMemo<BestLapRow[]>(() => {
    if (!data) return [];
    const best = new Map<number, { time: number; lap: number }>();
    for (const lap of data) {
      if (lap.lap_duration == null) continue;
      const current = best.get(lap.driver_number);
      if (!current || lap.lap_duration < current.time) {
        best.set(lap.driver_number, {
          time: lap.lap_duration,
          lap: lap.lap_number,
        });
      }
    }
    const overallBest = Math.min(...[...best.values()].map((b) => b.time));
    return [...best.entries()].map(([driverNumber, b]) => {
      const meta = driverMap.get(driverNumber);
      return {
        driverNumber,
        acronym: meta?.acronym ?? String(driverNumber),
        teamColour: meta?.teamColour ?? "888888",
        bestTime: b.time,
        bestLapNumber: b.lap,
        gap: b.time - overallBest,
      };
    });
  }, [data, driverMap]);

  const sorted = useMemo(() => {
    const factor = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sortKey === "driver") return factor * a.acronym.localeCompare(b.acronym);
      if (sortKey === "gap") return factor * (a.gap - b.gap);
      return factor * (a.bestTime - b.bestTime);
    });
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "driver" ? "asc" : "asc");
    }
  }

  if (loading) return <TabLoading label="Loading lap times…" />;
  if (error) return <TabError onRetry={reload} />;
  if (rows.length === 0)
    return <TabEmpty message="No lap data available for this session." />;

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div>
      <p className="mb-4 text-sm text-neutral-400">
        Each driver&apos;s fastest lap. Tap a column header to sort.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3 font-medium">#</th>
              <SortableTh
                label="Driver"
                onClick={() => toggleSort("driver")}
                suffix={arrow("driver")}
              />
              <SortableTh
                label="Best lap"
                align="right"
                onClick={() => toggleSort("time")}
                suffix={arrow("time")}
              />
              <SortableTh
                label="Gap"
                align="right"
                onClick={() => toggleSort("gap")}
                suffix={arrow("gap")}
              />
              <th className="px-4 py-3 text-right font-medium">Lap</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.driverNumber}
                className="border-b border-border last:border-0 hover:bg-surface"
              >
                <td className="px-4 py-3 font-mono text-neutral-500">{i + 1}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 font-medium text-white">
                    <span
                      className="h-3 w-1 rounded-full"
                      style={{ backgroundColor: `#${row.teamColour}` }}
                    />
                    {row.acronym}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-white">
                  {formatLapTime(row.bestTime)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-neutral-400">
                  {row.gap === 0 ? "—" : `+${row.gap.toFixed(3)}`}
                </td>
                <td className="px-4 py-3 text-right font-mono text-neutral-500">
                  {row.bestLapNumber}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortableTh({
  label,
  onClick,
  suffix,
  align = "left",
}: {
  label: string;
  onClick: () => void;
  suffix: string;
  align?: "left" | "right";
}) {
  return (
    <th className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : ""}`}>
      <button
        type="button"
        onClick={onClick}
        className="uppercase tracking-wide transition-colors hover:text-white"
      >
        {label}
        {suffix}
      </button>
    </th>
  );
}
