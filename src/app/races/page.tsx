import Link from "next/link";
import type { Metadata } from "next";
import SeasonSelector from "@/components/SeasonSelector";
import { getRaces } from "@/lib/openf1";
import { resolveSeason, seasonHref } from "@/lib/seasons";
import { getProfile } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Races — PitWall",
  description: "Formula 1 race calendar and results by season.",
};

export default async function RacesPage({
  searchParams,
}: {
  searchParams: { season?: string };
}) {
  const { isPro } = await getProfile();
  const season = resolveSeason(searchParams.season, isPro);
  const races = await getRaces(season);

  return (
    <div className="container-page py-12">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{season} Races</h1>
          <p className="mt-1 text-neutral-400">
            Calendar &amp; winners · {races.length} rounds
          </p>
        </div>
        <SeasonSelector season={season} isPro={isPro} />
      </header>

      <ul className="flex flex-col gap-3">
        {races.map((race) => (
          <li key={race.sessionKey}>
            <Link
              href={seasonHref(`/races/${race.sessionKey}`, season)}
              className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-f1/40 hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background font-mono text-sm text-neutral-400">
                  {String(race.round).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="flex items-center gap-2 font-semibold text-white">
                    {race.countryFlag ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={race.countryFlag}
                        alt={race.country}
                        loading="lazy"
                        className="h-4 w-6 rounded object-cover ring-1 ring-border"
                      />
                    ) : null}
                    {race.name}
                  </h2>
                  <p className="text-sm text-neutral-400">{race.circuit}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 border-t border-border pt-3 sm:border-0 sm:pt-0 sm:text-right">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    Date
                  </p>
                  <p className="text-sm text-neutral-300">
                    {formatDate(race.date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    Winner
                  </p>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-white">
                    {race.winner ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-f1" />
                        {race.winner}
                      </>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
