import type { Metadata } from "next";
import DriverComparator from "@/components/DriverComparator";
import SeasonSelector from "@/components/SeasonSelector";
import UpgradeBanner from "@/components/UpgradeBanner";
import { getStandings } from "@/lib/openf1";
import { resolveSeason } from "@/lib/seasons";
import { getProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Advanced comparator — PitWall",
};

// Access to this route is gated by middleware (redirects anonymous users to
// /login). PRO gating for the feature itself happens here.
export default async function ComparePage({
  searchParams,
}: {
  searchParams: { season?: string };
}) {
  const { isPro } = await getProfile();
  const season = resolveSeason(searchParams.season, isPro);
  const standings = await getStandings(season);

  return (
    <div className="container-page py-12">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Advanced comparator</h1>
          <p className="mt-1 text-neutral-400">
            Compare any pair of drivers across every stat.
          </p>
        </div>
        {isPro && <SeasonSelector season={season} isPro={isPro} />}
      </header>

      {isPro ? (
        <DriverComparator drivers={standings} isPro />
      ) : (
        <UpgradeBanner
          title="PRO advanced comparator"
          description="Full head-to-head comparison across the whole grid is a PitWall PRO feature."
        />
      )}
    </div>
  );
}
