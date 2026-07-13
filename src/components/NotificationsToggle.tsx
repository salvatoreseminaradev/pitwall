"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Opt-in toggle for race-weekend notifications (PRO). Persists the preference
 * to the user's Supabase profile. Actual delivery (email/push) is handled by a
 * separate scheduled job — this stores the preference it reads from.
 */
export default function NotificationsToggle({
  userId,
  initialEnabled,
}: {
  userId: string;
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (!isSupabaseConfigured) return;
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    setError(null);

    // Only `race_notifications` is column-granted to authenticated users (see
    // supabase/schema.sql) — billing fields are service-role only.
    const { error } = await createClient()
      .from("profiles")
      .update({ race_notifications: next })
      .eq("id", userId);

    if (error) {
      setEnabled(!next); // revert on failure
      setError("Couldn't save your preference. Please try again.");
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-white">Race notifications</p>
          <p className="text-sm text-neutral-400">
            Get a reminder before each race weekend.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={toggle}
          disabled={saving}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
            enabled ? "bg-f1" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
