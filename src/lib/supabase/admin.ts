import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

/**
 * Service-role Supabase client — SERVER ONLY.
 *
 * Bypasses Row Level Security, so it must never be imported into client code.
 * Used by the Lemon Squeezy webhook to flip `is_pro` after a successful payment.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseConfig.url || !serviceRoleKey) {
    throw new Error("Supabase service-role credentials are not configured.");
  }
  return createClient(supabaseConfig.url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
