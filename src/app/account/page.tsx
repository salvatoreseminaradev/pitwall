import Link from "next/link";
import type { Metadata } from "next";
import NotificationsToggle from "@/components/NotificationsToggle";
import UpgradeBanner from "@/components/UpgradeBanner";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getNextRace, CURRENT_SEASON } from "@/lib/openf1";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Account — PitWall" };

// Access gated by middleware (anonymous users are redirected to /login).
export default async function AccountPage() {
  const { user, isPro } = await getProfile();

  // Read the stored notification preference (owner-scoped via RLS).
  let notificationsEnabled = false;
  if (user && isSupabaseConfigured) {
    const { data } = await createClient()
      .from("profiles")
      .select("race_notifications")
      .eq("id", user.id)
      .single();
    notificationsEnabled = Boolean(data?.race_notifications);
  }

  const nextRace = await getNextRace(CURRENT_SEASON);

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Account</h1>
        <p className="mt-1 text-neutral-400">
          {user?.email ?? "Preview mode"} ·{" "}
          <span className={isPro ? "text-f1" : "text-neutral-500"}>
            {isPro ? "PRO" : "FREE"}
          </span>
        </p>
      </header>

      <section className="max-w-xl">
        <h2 className="mb-4 text-xl font-semibold text-white">Notifications</h2>

        {isPro ? (
          <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
            <NotificationsToggle
              userId={user?.id ?? ""}
              initialEnabled={notificationsEnabled}
            />
            <div className="border-t border-border pt-4 text-sm">
              <p className="text-neutral-500">Next race</p>
              {nextRace ? (
                <Link
                  href={`/races/${nextRace.sessionKey}`}
                  className="font-medium text-white hover:text-f1"
                >
                  {nextRace.name} · {formatDate(nextRace.date)}
                </Link>
              ) : (
                <p className="text-neutral-400">
                  No upcoming races in the {CURRENT_SEASON} calendar. You&apos;ll
                  be notified when the next season is scheduled.
                </p>
              )}
            </div>
          </div>
        ) : (
          <UpgradeBanner
            title="Race notifications"
            description="Race-weekend reminders are a PitWall PRO feature."
          />
        )}
      </section>
    </div>
  );
}
