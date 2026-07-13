"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LapTrace } from "@/types";
import { formatLapTime } from "@/lib/utils";

/**
 * Overlays lap-time traces for the podium finishers.
 * Recharts wants one row per X value, so we pivot the traces into
 * `{ lap, <ACRONYM>: duration, ... }` rows keyed by lap number.
 */
export default function LapTimesChart({ traces }: { traces: LapTrace[] }) {
  const byLap = new Map<number, Record<string, number>>();
  for (const trace of traces) {
    for (const { lap, duration } of trace.laps) {
      const row = byLap.get(lap) ?? { lap };
      row[trace.acronym] = duration;
      byLap.set(lap, row);
    }
  }
  const data = [...byLap.values()].sort((a, b) => a.lap - b.lap);

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">
        No lap-time data available for this race.
      </p>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis
            dataKey="lap"
            stroke="#525252"
            tick={{ fill: "#a3a3a3", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#262626" }}
            label={{
              value: "Lap",
              position: "insideBottom",
              offset: -2,
              fill: "#525252",
              fontSize: 11,
            }}
          />
          <YAxis
            stroke="#525252"
            tick={{ fill: "#a3a3a3", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#262626" }}
            domain={["dataMin - 1", "dataMax + 1"]}
            tickFormatter={(v) => formatLapTime(v as number)}
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: "#141414",
              border: "1px solid #262626",
              borderRadius: "0.5rem",
              color: "#fff",
            }}
            labelFormatter={(l) => `Giro ${l}`}
            formatter={(value: number, name) => [formatLapTime(value), name]}
          />
          {traces.map((trace) => (
            <Line
              key={trace.acronym}
              type="monotone"
              dataKey={trace.acronym}
              name={trace.acronym}
              stroke={`#${trace.teamColour}`}
              strokeWidth={2}
              dot={false}
              connectNulls
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap justify-center gap-4">
        {traces.map((trace) => (
          <span
            key={trace.acronym}
            className="flex items-center gap-1.5 text-xs text-neutral-400"
          >
            <span
              className="h-2 w-4 rounded-full"
              style={{ backgroundColor: `#${trace.teamColour}` }}
            />
            {trace.acronym}
          </span>
        ))}
      </div>
    </div>
  );
}
