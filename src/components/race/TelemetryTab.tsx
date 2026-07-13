"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CarData, Lap, SessionDriver } from "@/types";
import { useOpenF1, dateWindow } from "@/lib/openf1-client";
import { TabError, TabLoading, TabEmpty } from "./TabState";

interface Point {
  t: number; // seconds elapsed within the lap
  speed: number;
  throttle: number;
  brake: number;
  gear: number;
}

const FALLBACK_A = "#e10600";
const FALLBACK_B = "#ffffff";

function pickColors(
  a: SessionDriver | undefined,
  b: SessionDriver | undefined,
): [string, string] {
  let ca = a?.teamColour ? `#${a.teamColour}` : FALLBACK_A;
  let cb = b?.teamColour ? `#${b.teamColour}` : FALLBACK_B;
  if (b && ca.toLowerCase() === cb.toLowerCase()) {
    ca = FALLBACK_A;
    cb = FALLBACK_B;
  }
  return [ca, cb];
}

/** Build {t, speed, throttle, brake, gear} points relative to the lap start. */
function toSeries(rows: CarData[] | null, lapStartMs: number | null): Point[] {
  if (!rows || lapStartMs == null) return [];
  return rows
    .map((r) => ({
      t: (Date.parse(r.date) - lapStartMs) / 1000,
      speed: r.speed,
      throttle: r.throttle,
      brake: r.brake,
      gear: r.n_gear,
    }))
    .filter((p) => p.t >= 0)
    .sort((a, b) => a.t - b.t);
}

export default function TelemetryTab({
  sessionKey,
  drivers,
}: {
  sessionKey: number;
  drivers: SessionDriver[];
}) {
  // Session laps drive both the lap selector and each lap's time window.
  const {
    data: laps,
    loading: lapsLoading,
    error: lapsError,
    reload,
  } = useOpenF1<Lap>(`/laps?session_key=${sessionKey}`);

  const [driverA, setDriverA] = useState<number | null>(null);
  const [driverB, setDriverB] = useState<number | null>(null);
  const [lapNumber, setLapNumber] = useState<number | null>(null);

  // Default the primary driver once laps arrive.
  useEffect(() => {
    if (driverA == null && drivers.length > 0) {
      setDriverA(drivers[0].driverNumber);
    }
  }, [drivers, driverA]);

  // Laps available for the primary driver (with a usable time window).
  const lapOptions = useMemo(() => {
    if (!laps || driverA == null) return [];
    return laps
      .filter(
        (l) =>
          l.driver_number === driverA &&
          l.date_start != null &&
          l.lap_duration != null,
      )
      .sort((a, b) => a.lap_number - b.lap_number);
  }, [laps, driverA]);

  // Keep the selected lap valid when the driver changes.
  useEffect(() => {
    if (lapOptions.length === 0) return;
    if (!lapOptions.some((l) => l.lap_number === lapNumber)) {
      setLapNumber(lapOptions[0].lap_number);
    }
  }, [lapOptions, lapNumber]);

  // Resolve the [start, end] window for a driver's selected lap.
  function windowFor(driver: number | null): { start: string; end: string } | null {
    if (!laps || driver == null || lapNumber == null) return null;
    const lap = laps.find(
      (l) => l.driver_number === driver && l.lap_number === lapNumber,
    );
    if (!lap?.date_start || lap.lap_duration == null) return null;
    const start = lap.date_start;
    const end = new Date(Date.parse(start) + lap.lap_duration * 1000).toISOString();
    return { start, end };
  }

  const winA = windowFor(driverA);
  const winB = windowFor(driverB);

  const pathA =
    driverA != null && winA
      ? `/car_data?session_key=${sessionKey}&driver_number=${driverA}${dateWindow(winA.start, winA.end)}`
      : null;
  const pathB =
    driverB != null && winB
      ? `/car_data?session_key=${sessionKey}&driver_number=${driverB}${dateWindow(winB.start, winB.end)}`
      : null;

  const carA = useOpenF1<CarData>(pathA);
  const carB = useOpenF1<CarData>(pathB);

  const seriesA = useMemo(
    () => toSeries(carA.data, winA ? Date.parse(winA.start) : null),
    [carA.data, winA],
  );
  const seriesB = useMemo(
    () => toSeries(carB.data, winB ? Date.parse(winB.start) : null),
    [carB.data, winB],
  );

  const metaA = drivers.find((d) => d.driverNumber === driverA);
  const metaB = drivers.find((d) => d.driverNumber === driverB);
  const [colorA, colorB] = pickColors(metaA, metaB);

  if (lapsLoading) return <TabLoading label="Loading session laps…" />;
  if (lapsError) return <TabError onRetry={reload} />;

  const telemetryLoading =
    (pathA && carA.loading) || (pathB && carB.loading);
  const telemetryError = (pathA && carA.error) || (pathB && carB.error);
  const hasData = seriesA.length > 0 || seriesB.length > 0;

  return (
    <div>
      {/* Selectors */}
      <div className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-3">
        <DriverSelect
          label="Driver A"
          value={driverA}
          onChange={setDriverA}
          drivers={drivers}
          accent={colorA}
        />
        <DriverSelect
          label="Driver B (optional)"
          value={driverB}
          onChange={setDriverB}
          drivers={drivers}
          accent={colorB}
          allowNone
        />
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
            Lap
          </span>
          <select
            value={lapNumber ?? ""}
            onChange={(e) => setLapNumber(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-white outline-none focus:border-f1"
          >
            {lapOptions.map((l) => (
              <option key={l.lap_number} value={l.lap_number}>
                Lap {l.lap_number}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-neutral-400">
        {metaA && (
          <Legend color={colorA} label={metaA.acronym} />
        )}
        {metaB && <Legend color={colorB} label={metaB.acronym} />}
      </div>

      {/* Charts */}
      <div className="mt-4">
        {telemetryError ? (
          <TabError onRetry={() => { carA.reload(); carB.reload(); }} />
        ) : telemetryLoading ? (
          <TabLoading label="Loading telemetry…" />
        ) : !hasData ? (
          <TabEmpty message="Select a driver and lap to load telemetry." />
        ) : (
          <div className="space-y-6">
            <TelemetryChart
              title="Speed (km/h)"
              seriesA={seriesA}
              seriesB={seriesB}
              dataKey="speed"
              colorA={colorA}
              colorB={colorB}
              nameA={metaA?.acronym}
              nameB={metaB?.acronym}
            />
            <ThrottleBrakeChart
              seriesA={seriesA}
              seriesB={seriesB}
              colorA={colorA}
              colorB={colorB}
              nameA={metaA?.acronym}
              nameB={metaB?.acronym}
            />
            <TelemetryChart
              title="Gear"
              seriesA={seriesA}
              seriesB={seriesB}
              dataKey="gear"
              colorA={colorA}
              colorB={colorB}
              nameA={metaA?.acronym}
              nameB={metaB?.acronym}
              stepped
              yDomain={[0, 8]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-2 w-4 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function DriverSelect({
  label,
  value,
  onChange,
  drivers,
  accent,
  allowNone = false,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  drivers: SessionDriver[];
  accent: string;
  allowNone?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        {label}
      </span>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-white outline-none focus:border-f1"
      >
        {allowNone && <option value="">None</option>}
        {drivers.map((d) => (
          <option key={d.driverNumber} value={d.driverNumber}>
            {d.acronym} · #{d.driverNumber}
          </option>
        ))}
      </select>
    </label>
  );
}

const AXIS = {
  stroke: "#525252",
  tick: { fill: "#a3a3a3", fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: "#262626" },
} as const;

const TOOLTIP = {
  contentStyle: {
    background: "#141414",
    border: "1px solid #262626",
    borderRadius: "0.5rem",
    color: "#fff",
  },
  labelStyle: { color: "#a3a3a3" },
} as const;

function TelemetryChart({
  title,
  seriesA,
  seriesB,
  dataKey,
  colorA,
  colorB,
  nameA,
  nameB,
  stepped = false,
  yDomain,
}: {
  title: string;
  seriesA: Point[];
  seriesB: Point[];
  dataKey: keyof Point;
  colorA: string;
  colorB: string;
  nameA?: string;
  nameB?: string;
  stepped?: boolean;
  yDomain?: [number, number];
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis
              type="number"
              dataKey="t"
              domain={["dataMin", "dataMax"]}
              unit="s"
              {...AXIS}
            />
            <YAxis domain={yDomain ?? ["auto", "auto"]} {...AXIS} />
            <Tooltip
              {...TOOLTIP}
              labelFormatter={(v) => `${Number(v).toFixed(1)}s`}
            />
            {seriesA.length > 0 && (
              <Line
                data={seriesA}
                dataKey={dataKey}
                name={nameA}
                stroke={colorA}
                strokeWidth={2}
                dot={false}
                type={stepped ? "stepAfter" : "monotone"}
                isAnimationActive={false}
              />
            )}
            {seriesB.length > 0 && (
              <Line
                data={seriesB}
                dataKey={dataKey}
                name={nameB}
                stroke={colorB}
                strokeWidth={2}
                dot={false}
                type={stepped ? "stepAfter" : "monotone"}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function ThrottleBrakeChart({
  seriesA,
  seriesB,
  colorA,
  colorB,
  nameA,
  nameB,
}: {
  seriesA: Point[];
  seriesB: Point[];
  colorA: string;
  colorB: string;
  nameA?: string;
  nameB?: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <h3 className="mb-1 text-sm font-semibold text-white">Throttle &amp; Brake</h3>
      <p className="mb-3 text-xs text-neutral-500">
        Solid = throttle %, dashed = brake.
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis
              type="number"
              dataKey="t"
              domain={["dataMin", "dataMax"]}
              unit="s"
              {...AXIS}
            />
            <YAxis domain={[0, 100]} {...AXIS} />
            <Tooltip
              {...TOOLTIP}
              labelFormatter={(v) => `${Number(v).toFixed(1)}s`}
            />
            {seriesA.length > 0 && (
              <>
                <Line
                  data={seriesA}
                  dataKey="throttle"
                  name={`${nameA} throttle`}
                  stroke={colorA}
                  strokeWidth={2}
                  dot={false}
                  type="monotone"
                  isAnimationActive={false}
                />
                <Line
                  data={seriesA}
                  dataKey="brake"
                  name={`${nameA} brake`}
                  stroke={colorA}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  type="monotone"
                  isAnimationActive={false}
                />
              </>
            )}
            {seriesB.length > 0 && (
              <>
                <Line
                  data={seriesB}
                  dataKey="throttle"
                  name={`${nameB} throttle`}
                  stroke={colorB}
                  strokeWidth={2}
                  dot={false}
                  type="monotone"
                  isAnimationActive={false}
                />
                <Line
                  data={seriesB}
                  dataKey="brake"
                  name={`${nameB} brake`}
                  stroke={colorB}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  type="monotone"
                  isAnimationActive={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
