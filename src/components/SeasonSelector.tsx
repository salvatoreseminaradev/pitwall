"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AVAILABLE_SEASONS, CURRENT_SEASON } from "@/lib/seasons";

/**
 * Season switcher. PRO users get a real dropdown across all available seasons;
 * FREE users see the current season with a prompt to upgrade for history.
 */
export default function SeasonSelector({
  season,
  isPro,
}: {
  season: number;
  isPro: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  if (!isPro) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="rounded-lg border border-border bg-surface px-3 py-2 font-medium text-white">
          {CURRENT_SEASON}
        </span>
        <Link
          href="/pricing"
          className="text-neutral-400 transition-colors hover:text-f1"
        >
          🔒 Past seasons with PRO
        </Link>
      </div>
    );
  }

  function handleChange(value: string) {
    const year = Number(value);
    const query =
      year === CURRENT_SEASON ? "" : `?season=${year}`;
    router.push(`${pathname}${query}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-neutral-500">Season</span>
      <select
        value={season}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 font-medium text-white outline-none transition-colors focus:border-f1"
      >
        {AVAILABLE_SEASONS.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </label>
  );
}
