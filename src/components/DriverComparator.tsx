"use client";

import { useState } from "react";
import Link from "next/link";
import type { DriverStanding } from "@/types";

export default function DriverComparator({
  drivers,
  isPro = false,
}: {
  drivers: DriverStanding[];
  isPro?: boolean;
}) {
  const [leftNum, setLeftNum] = useState(drivers[0]?.driverNumber ?? 0);
  const [rightNum, setRightNum] = useState(drivers[1]?.driverNumber ?? 0);
  const [result, setResult] = useState<{
    left: DriverStanding;
    right: DriverStanding;
  } | null>(null);

  const handleCompare = () => {
    const left = drivers.find((d) => d.driverNumber === leftNum);
    const right = drivers.find((d) => d.driverNumber === rightNum);
    if (left && right) setResult({ left, right });
  };

  const sameDriver = leftNum === rightNum;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <Select label="Driver A" value={leftNum} onChange={setLeftNum} drivers={drivers} />
        <span className="hidden pb-3 text-center text-sm font-semibold text-f1 sm:block">
          VS
        </span>
        <Select label="Driver B" value={rightNum} onChange={setRightNum} drivers={drivers} />
      </div>

      <button
        type="button"
        onClick={handleCompare}
        disabled={sameDriver}
        className="mt-5 w-full rounded-lg bg-f1 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-f1-hover disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Compare
      </button>

      {sameDriver && (
        <p className="mt-3 text-xs text-neutral-500">
          Pick two different drivers to compare them.
        </p>
      )}

      {result && !sameDriver && (
        <ComparisonResult left={result.left} right={result.right} isPro={isPro} />
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  drivers,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  drivers: DriverStanding[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-white outline-none transition-colors focus:border-f1"
      >
        {drivers.map((d) => (
          <option key={d.driverNumber} value={d.driverNumber}>
            {d.fullName} · {d.team}
          </option>
        ))}
      </select>
    </label>
  );
}

const BASIC_ROWS = [
  { label: "Wins", key: "wins" },
  { label: "Podiums", key: "podiums" },
  { label: "Points", key: "points" },
] as const;

const PRO_ROWS = [
  { label: "Best finish", key: "bestFinish", lowerIsBetter: true },
] as const;

function ComparisonResult({
  left,
  right,
  isPro,
}: {
  left: DriverStanding;
  right: DriverStanding;
  isPro: boolean;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-3 items-center bg-background px-4 py-3 text-sm font-semibold">
        <Link
          href={`/drivers/${left.driverNumber}`}
          className="text-white hover:text-f1"
        >
          {left.acronym}
        </Link>
        <span className="text-center text-xs text-neutral-500">STAT</span>
        <Link
          href={`/drivers/${right.driverNumber}`}
          className="text-right text-white hover:text-f1"
        >
          {right.acronym}
        </Link>
      </div>

      {BASIC_ROWS.map((row) => (
        <StatRow
          key={row.key}
          label={row.label}
          left={left[row.key]}
          right={right[row.key]}
        />
      ))}

      {isPro ? (
        PRO_ROWS.map((row) => (
          <StatRow
            key={row.key}
            label={row.label}
            left={left[row.key]}
            right={right[row.key]}
            lowerIsBetter={row.lowerIsBetter}
          />
        ))
      ) : (
        <Link
          href="/pricing"
          className="block border-t border-border bg-background/40 px-4 py-3 text-center text-xs text-neutral-400 hover:text-f1"
        >
          🔒 Advanced stats and full head-to-head with PitWall PRO →
        </Link>
      )}
    </div>
  );
}

function StatRow({
  label,
  left,
  right,
  lowerIsBetter = false,
}: {
  label: string;
  left: number;
  right: number;
  lowerIsBetter?: boolean;
}) {
  const leftWins = lowerIsBetter ? left <= right : left >= right;
  const rightWins = lowerIsBetter ? right <= left : right >= left;
  return (
    <div className="grid grid-cols-3 items-center border-t border-border px-4 py-3 text-sm">
      <span className={`font-mono ${leftWins ? "text-f1" : "text-neutral-400"}`}>
        {left}
      </span>
      <span className="text-center text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <span
        className={`text-right font-mono ${rightWins ? "text-f1" : "text-neutral-400"}`}
      >
        {right}
      </span>
    </div>
  );
}
