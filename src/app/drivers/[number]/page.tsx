import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DriverPointsChart from "@/components/DriverPointsChart";
import ExportableChart from "@/components/ExportableChart";
import DataDisclaimer from "@/components/DataDisclaimer";
import { getDriver, getStandings } from "@/lib/openf1";
import { resolveSeason, seasonHref } from "@/lib/seasons";
import { getProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { number: string };
  searchParams: { season?: string };
}): Promise<Metadata> {
  const season = resolveSeason(searchParams.season, true);
  const driver = await getDriver(season, Number(params.number));
  return { title: driver ? `${driver.fullName} — PitWall` : "Driver — PitWall" };
}

export default async function DriverProfilePage({
  params,
  searchParams,
}: {
  params: { number: string };
  searchParams: { season?: string };
}) {
  const { isPro } = await getProfile();
  const season = resolveSeason(searchParams.season, isPro);
  const driverNumber = Number(params.number);

  const [driver, standings] = await Promise.all([
    getDriver(season, driverNumber),
    getStandings(season),
  ]);

  if (!driver) notFound();

  const rank = standings.findIndex((d) => d.driverNumber === driverNumber) + 1;

  const stats = [
    { label: "Position", value: rank > 0 ? `P${rank}` : "—" },
    { label: "Points", value: driver.points },
    { label: "Wins", value: driver.wins },
    { label: "Podiums", value: driver.podiums },
    { label: "Best finish", value: `P${driver.bestFinish}` },
  ];

  return (
    <div className="container-page py-12">
      <Link
        href={seasonHref("/drivers", season)}
        className="text-sm text-neutral-400 hover:text-white"
      >
        ← All drivers
      </Link>

      {/* Header */}
      <header className="mt-6 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-5">
          {driver.headshot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={driver.headshot}
              alt={driver.fullName}
              className="h-20 w-20 rounded-full bg-surface object-cover ring-2"
              style={{ boxShadow: `0 0 0 2px #${driver.teamColour}` }}
            />
          ) : null}
          <div>
            <p
              className="font-mono text-sm"
              style={{ color: `#${driver.teamColour}` }}
            >
              #{driver.driverNumber}
            </p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {driver.fullName}
            </h1>
            <p className="mt-1 text-neutral-400">
              {driver.team} · {season}
            </p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              {s.value}
            </p>
          </div>
        ))}
      </section>

      {/* Points chart */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Points per race · {season}
        </h2>
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <ExportableChart
            filename={`${driver.acronym}-${season}-points`}
            isPro={isPro}
          >
            <DriverPointsChart
              data={driver.pointsByRace}
              color={`#${driver.teamColour}`}
            />
          </ExportableChart>
        </div>
      </section>

      <DataDisclaimer />
    </div>
  );
}
