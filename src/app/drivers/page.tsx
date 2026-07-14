import type { Metadata } from "next";
import DriverCard from "@/components/DriverCard";
import SeasonSelector from "@/components/SeasonSelector";
import UpgradeBanner from "@/components/UpgradeBanner";
import { getStandings } from "@/lib/openf1";
import { resolveSeason } from "@/lib/seasons";
import { getProfile, FREE_DRIVER_LIMIT } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Drivers — PitWall",
  description: "Formula 1 driver standings by season.",
};

export default async function DriversPage({
  searchParams,
}: {
  searchParams: { season?: string };
}) {
  const { isPro } = await getProfile();
  const season = resolveSeason(searchParams.season, isPro);
  const standings = await getStandings(season);

  const visible = isPro ? standings : standings.slice(0, FREE_DRIVER_LIMIT);
  const hiddenCount = standings.length - visible.length;

  return (
    <div className="container-page py-12">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Drivers</h1>
          <p className="mt-1 text-neutral-400">
            {season} standings · {standings.length} drivers
          </p>
        </div>
        <SeasonSelector season={season} isPro={isPro} />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((driver, i) => (
          <DriverCard
            key={driver.driverNumber}
            driver={driver}
            position={i + 1}
            season={season}
          />
        ))}
      </div>

      {!isPro && hiddenCount > 0 && (
        <div className="mt-8">
          <UpgradeBanner
            title="Full standings"
            description={`You're seeing the top ${FREE_DRIVER_LIMIT} drivers. Unlock the other ${hiddenCount} plus full season history with PitWall PRO.`}
          />
        </div>
      )}
    </div>
  );
}
