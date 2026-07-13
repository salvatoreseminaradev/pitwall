import Link from "next/link";
import type { Metadata } from "next";
import UpgradeButton from "@/components/UpgradeButton";
import { getProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing — PitWall",
  description: "Go PitWall PRO for advanced stats and tools.",
};

const FREE_FEATURES = [
  "Current season",
  "Top 5 drivers in the standings",
  "Basic charts (points per race)",
  "Race results and lap times",
];

const PRO_FEATURES = [
  "Full history, all seasons",
  "Full standings & driver grid",
  "Advanced head-to-head comparator",
  "Chart export (PNG)",
  "Race notifications",
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: { upgraded?: string };
}) {
  const { user, isPro } = await getProfile();
  const justUpgraded = searchParams.upgraded === "1";

  return (
    <div className="container-page py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Choose your plan
        </h1>
        <p className="mt-3 text-neutral-400">
          Start free. Go PRO when you want the full picture.
        </p>
      </header>

      {justUpgraded && (
        <p className="mx-auto mt-6 max-w-xl rounded-lg border border-green-600/40 bg-green-600/10 px-4 py-3 text-center text-sm text-green-300">
          Thanks for your purchase! PRO access is activated as soon as we confirm
          the payment.
        </p>
      )}

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        {/* FREE */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-lg font-semibold text-white">Free</h2>
          <p className="mt-2 text-3xl font-bold text-white">
            €0<span className="text-base font-normal text-neutral-500">/mo</span>
          </p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-neutral-300">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-0.5 text-neutral-500">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {user ? (
              <span className="block rounded-lg border border-border px-5 py-3 text-center text-sm font-medium text-neutral-400">
                {isPro ? "Included in your plan" : "Current plan"}
              </span>
            ) : (
              <Link
                href="/register"
                className="block rounded-lg border border-border px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-surface-hover"
              >
                Start free
              </Link>
            )}
          </div>
        </div>

        {/* PRO */}
        <div className="relative flex flex-col rounded-2xl border border-f1/50 bg-surface p-8 shadow-glow">
          <span className="absolute -top-3 left-8 rounded-full bg-f1 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Recommended
          </span>
          <h2 className="text-lg font-semibold text-white">
            Pro <span className="text-f1">🏆</span>
          </h2>
          <p className="mt-2 text-3xl font-bold text-white">
            €7<span className="text-base font-normal text-neutral-500">/mo</span>
          </p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-neutral-300">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-0.5 text-f1">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {isPro ? (
              <span className="block rounded-lg bg-f1/15 px-5 py-3 text-center text-sm font-semibold text-f1">
                You&apos;re PRO ✓
              </span>
            ) : (
              <UpgradeButton isAuthenticated={Boolean(user)} />
            )}
          </div>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-neutral-500">
        Payments handled securely by Lemon Squeezy. Cancel anytime.
      </p>
    </div>
  );
}
