import Link from "next/link";
import DriverComparator from "@/components/DriverComparator";
import DriverCard from "@/components/DriverCard";
import RaceCard from "@/components/RaceCard";
import UpgradeBanner from "@/components/UpgradeBanner";
import { getSeason } from "@/lib/openf1";
import { resolveSeason } from "@/lib/seasons";
import { getProfile, FREE_DRIVER_LIMIT } from "@/lib/auth";

// Rendered on demand (reads the auth cookie for FREE/PRO gating); the OpenF1
// fetches underneath are still cached for an hour at the data-cache level.
export const dynamic = "force-dynamic";
// Give the (rare) cold OpenF1 aggregation room on serverless.
export const maxDuration = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { season?: string };
}) {
  const { isPro } = await getProfile();
  const season = resolveSeason(searchParams.season, isPro);
  const { races, standings } = await getSeason(season);

  const topDrivers = standings.slice(0, FREE_DRIVER_LIMIT);
  const latestRaces = [...races]
    .filter((r) => r.winner) // only completed races
    .sort((a, b) => b.round - a.round)
    .slice(0, 3);

  // FREE users compare the top 5; PRO users get the whole grid.
  const comparatorDrivers = isPro ? standings : topDrivers;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,6,0,0.15),transparent_60%)]"
        />
        <div className="container-page relative py-20 sm:py-28">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-neutral-400">
            <span className="h-1.5 w-1.5 rounded-full bg-f1" />
            {season} season · live OpenF1 data
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            The Formula 1 <span className="text-f1">pit wall</span>, one click
            away.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-neutral-400">
            Driver stats, race results and real lap times. All in one dashboard,
            on desktop and mobile.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/drivers"
              className="rounded-lg bg-f1 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-f1-hover"
            >
              Explore drivers
            </Link>
            <Link
              href="/races"
              className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-surface-hover"
            >
              Race calendar
            </Link>
          </div>
        </div>
      </section>

      {/* Top drivers */}
      <section className="container-page py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Driver standings</h2>
            <p className="mt-1 text-neutral-400">
              {isPro ? "Full standings" : `Top ${FREE_DRIVER_LIMIT}`} · {season}{" "}
              season
            </p>
          </div>
          <Link
            href="/drivers"
            className="text-sm font-medium text-f1 hover:text-f1-hover"
          >
            All drivers →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {topDrivers.map((driver, i) => (
            <DriverCard
              key={driver.driverNumber}
              driver={driver}
              position={i + 1}
              season={season}
            />
          ))}
        </div>
      </section>

      {/* Driver comparator */}
      <section className="container-page py-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Driver comparator</h2>
          <p className="mt-1 text-neutral-400">
            Pick two drivers and compare their season stats.
          </p>
        </div>
        {comparatorDrivers.length >= 2 ? (
          <DriverComparator drivers={comparatorDrivers} isPro={isPro} />
        ) : (
          <UpgradeBanner description="Driver data isn't available right now." />
        )}
      </section>

      {/* Latest races */}
      <section className="container-page py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Latest races</h2>
            <p className="mt-1 text-neutral-400">
              The season&apos;s most recent rounds.
            </p>
          </div>
          <Link
            href="/races"
            className="text-sm font-medium text-f1 hover:text-f1-hover"
          >
            All races →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestRaces.map((race) => (
            <RaceCard key={race.sessionKey} race={race} season={season} />
          ))}
        </div>
      </section>
    </>
  );
}
