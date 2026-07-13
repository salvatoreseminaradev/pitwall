"use client";

import Link from "next/link";
import type { ClassificationRow, LapTrace } from "@/types";
import LapTimesChart from "@/components/LapTimesChart";
import ExportableChart from "@/components/ExportableChart";
import { seasonHref } from "@/lib/seasons";
import { formatGap } from "@/lib/utils";

export default function ResultsTab({
  classification,
  lapTraces,
  isPro,
  season,
  circuit,
}: {
  classification: ClassificationRow[];
  lapTraces: LapTrace[];
  isPro: boolean;
  season: number;
  circuit: string;
}) {
  return (
    <div className="space-y-10">
      {/* Lap times chart */}
      <section>
        <h2 className="mb-1 text-xl font-semibold text-white">
          Lap times — podium
        </h2>
        <p className="mb-4 text-sm text-neutral-400">
          Lap-time progression of the top three finishers.
        </p>
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <ExportableChart
            filename={`${circuit}-${season}-laptimes`}
            isPro={isPro}
          >
            <LapTimesChart traces={lapTraces} />
          </ExportableChart>
        </div>
      </section>

      {/* Classification */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">
          Final classification
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3 font-medium">Pos</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 text-right font-medium">Gap</th>
                <th className="px-4 py-3 text-right font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {classification.map((row) => (
                <tr
                  key={row.driverNumber}
                  className="border-b border-border last:border-0 hover:bg-surface"
                >
                  <td className="px-4 py-3 font-mono text-neutral-300">
                    {row.dnf ? "DNF" : (row.position ?? "—")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={seasonHref(`/drivers/${row.driverNumber}`, season)}
                      className="flex items-center gap-2 font-medium text-white hover:text-f1"
                    >
                      <span
                        className="h-3 w-1 rounded-full"
                        style={{ backgroundColor: `#${row.teamColour}` }}
                      />
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{row.team}</td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-400">
                    {row.position === 1 ? "—" : formatGap(row.gap)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                    {row.points || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
