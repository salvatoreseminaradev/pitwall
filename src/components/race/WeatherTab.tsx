"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeatherRow } from "@/types";
import { useOpenF1 } from "@/lib/openf1-client";
import { TabError, TabLoading, TabEmpty } from "./TabState";

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

export default function WeatherTab({ sessionKey }: { sessionKey: number }) {
  const { data, loading, error, reload } = useOpenF1<WeatherRow>(
    `/weather?session_key=${sessionKey}`,
  );

  const chartData = useMemo(
    () =>
      (data ?? [])
        .slice()
        .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
        .map((w) => ({
          time: timeFmt.format(new Date(w.date)),
          air: w.air_temperature,
          track: w.track_temperature,
        })),
    [data],
  );

  const summary = useMemo(() => {
    if (!data || data.length === 0) return null;
    const avg = (fn: (w: WeatherRow) => number) =>
      data.reduce((s, w) => s + fn(w), 0) / data.length;
    return {
      humidity: avg((w) => w.humidity),
      wind: avg((w) => w.wind_speed),
      rain: data.some((w) => w.rainfall > 0),
    };
  }, [data]);

  if (loading) return <TabLoading label="Loading weather…" />;
  if (error) return <TabError onRetry={reload} />;
  if (!summary) return <TabEmpty message="No weather data for this session." />;

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Avg humidity"
          value={`${summary.humidity.toFixed(0)}%`}
          icon="💧"
        />
        <SummaryCard
          label="Avg wind"
          value={`${summary.wind.toFixed(1)} m/s`}
          icon="💨"
        />
        <SummaryCard
          label="Rain"
          value={summary.rain ? "Yes" : "No"}
          icon={summary.rain ? "🌧️" : "☀️"}
        />
      </div>

      {/* Temperature chart */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-white">
          Air &amp; track temperature (°C)
        </h3>
        <div className="h-72 w-full rounded-xl border border-border bg-surface p-4 sm:p-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis
                dataKey="time"
                stroke="#525252"
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#262626" }}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                stroke="#525252"
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#262626" }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "#141414",
                  border: "1px solid #262626",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                labelStyle={{ color: "#a3a3a3" }}
              />
              <Line
                type="monotone"
                dataKey="track"
                name="Track"
                stroke="#e10600"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="air"
                name="Air"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-f1" /> Track
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-sky-400" /> Air
          </span>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {label}
        </p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
