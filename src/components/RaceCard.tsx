import Link from "next/link";
import type { Race } from "@/types";
import { formatDate } from "@/lib/utils";
import { seasonHref } from "@/lib/seasons";

export default function RaceCard({
  race,
  season,
}: {
  race: Race;
  season: number;
}) {
  return (
    <Link
      href={seasonHref(`/races/${race.sessionKey}`, season)}
      className="flex flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-f1/40 hover:bg-surface-hover"
    >
      <div className="flex items-center justify-between">
        <span className="rounded bg-background px-2 py-1 font-mono text-xs text-neutral-400">
          R{String(race.round).padStart(2, "0")}
        </span>
        {race.countryFlag ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={race.countryFlag}
            alt={race.country}
            loading="lazy"
            className="h-5 w-8 rounded object-cover ring-1 ring-border"
          />
        ) : null}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-white">{race.name}</h3>
      <p className="text-sm text-neutral-400">{race.circuit}</p>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="text-neutral-500">{formatDate(race.date)}</span>
        {race.winner && (
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-f1" />
            {race.winner}
          </span>
        )}
      </div>
    </Link>
  );
}
