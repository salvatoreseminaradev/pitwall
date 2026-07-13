import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type Tier = "free" | "pro";

/** How many drivers a FREE user can see on standings/comparator. */
export const FREE_DRIVER_LIMIT = 5;

export interface Profile {
  user: User | null;
  isPro: boolean;
  tier: Tier;
}

/**
 * Resolve the current user + PRO flag for this request.
 * Degrades to an anonymous FREE profile when Supabase isn't configured or the
 * visitor isn't signed in, so pages never crash on missing auth.
 */
/**
 * Dev-only escape hatch to preview PRO features without a Supabase account.
 * Set NEXT_PUBLIC_FORCE_PRO=true in .env.local. Ignored in production builds.
 */
const devForcePro =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_FORCE_PRO === "true";

function profileFor(user: User | null, isPro: boolean): Profile {
  const pro = isPro || devForcePro;
  return { user, isPro: pro, tier: pro ? "pro" : "free" };
}

export const getProfile = cache(async (): Promise<Profile> => {
  if (!isSupabaseConfigured) {
    return profileFor(null, false);
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return profileFor(null, false);

    const { data } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", user.id)
      .single();

    return profileFor(user, Boolean(data?.is_pro));
  } catch {
    return profileFor(null, false);
  }
});
