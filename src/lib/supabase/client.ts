"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";

/** Browser-side Supabase client (used by client components: login/register forms). */
export function createClient() {
  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
}
