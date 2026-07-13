import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RaceTabs from "@/components/race/RaceTabs";
import DataDisclaimer from "@/components/DataDisclaimer";
import { getRaceDetail } from "@/lib/openf1";
import { resolveSeason, seasonHref } from "@/lib/seasons";
import { getProfile } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { session: string };
  searchParams: { season?: string };
}): Promise<Metadata> {
  const season = resolveSeason(searchParams.season, true);
  const detail = await getRaceDetail(season, Number(params.session));
  return { title: detail ? `${detail.race.name} — PitWall` : "Race — PitWall" };
}

export default async function RaceDetailPage({
  params,
  searchParams,
}: {
  params: { session: string };
  searchParams: { season?: string };
}) {
  const { isPro } = await getProfile();
  const season = resolveSeason(searchParams.season, isPro);
  const detail = await getRaceDetail(season, Number(params.session));
  if (!detail) notFound();

  const { race, classification, lapTraces, drivers } = detail;

  return (
    <div className="container-page py-12">
      <Link
        href={seasonHref("/races", season)}
        className="text-sm text-neutral-400 hover:text-white"
      >
        ← All races
      </Link>

      {/* Header */}
      <header className="mt-6 flex items-center gap-4 border-b border-border pb-8">
        {race.countryFlag ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={race.countryFlag}
            alt={race.country}
            className="h-10 w-16 rounded object-cover ring-1 ring-border"
          />
        ) : null}
        <div>
          <p className="font-mono text-sm text-f1">
            Round {race.round} · {formatDate(race.date)}
          </p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {race.name}
          </h1>
          <p className="mt-1 text-neutral-400">{race.circuit}</p>
        </div>
      </header>

      {/* Tabs: Results / Laps / Telemetry / Weather / Team Radio */}
      <RaceTabs
        sessionKey={race.sessionKey}
        season={season}
        circuit={race.circuit}
        raceDate={race.date}
        isPro={isPro}
        classification={classification}
        lapTraces={lapTraces}
        drivers={drivers}
      />

      <DataDisclaimer />
    </div>
  );
}
