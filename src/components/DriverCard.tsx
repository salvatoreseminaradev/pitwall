import Link from "next/link";
import type { DriverStanding } from "@/types";
import { seasonHref } from "@/lib/seasons";

export default function DriverCard({
  driver,
  position,
  season,
}: {
  driver: DriverStanding;
  position?: number;
  season: number;
}) {
  return (
    <Link
      href={seasonHref(`/drivers/${driver.driverNumber}`, season)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-5 transition-all hover:border-f1/60 hover:bg-surface-hover"
    >
      {/* Team-colour accent bar */}
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: `#${driver.teamColour}` }}
      />

      {/* Big number watermark */}
      <span className="pointer-events-none absolute -right-2 -top-3 select-none text-7xl font-black leading-none text-white/5 transition-colors group-hover:text-f1/10">
        {driver.driverNumber}
      </span>

      <div className="flex items-start justify-between">
        {position != null && (
          <span className="font-mono text-sm text-neutral-500">
            P{position}
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={driver.headshot}
          alt={driver.fullName}
          loading="lazy"
          className="h-14 w-14 rounded-full bg-background object-cover ring-1 ring-border"
        />
      </div>

      <h3 className="mt-3 text-lg font-semibold text-white">
        {driver.fullName}
      </h3>
      <p className="text-sm text-neutral-400">{driver.team}</p>

      <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
        <span className="rounded bg-background px-2 py-1 font-mono text-neutral-300">
          #{driver.driverNumber}
        </span>
        <span className="rounded bg-background px-2 py-1 font-semibold text-white">
          {driver.points} pt
        </span>
        {driver.wins > 0 && (
          <span className="rounded bg-background px-2 py-1">
            {driver.wins} 🏆
          </span>
        )}
      </div>
    </Link>
  );
}
