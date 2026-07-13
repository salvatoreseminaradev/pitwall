import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createProCheckout,
  isLemonSqueezyConfigured,
} from "@/lib/lemonsqueezy";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Creates a Lemon Squeezy checkout for the signed-in user and returns its URL.
 * The client redirects the browser to that URL.
 */
export async function POST() {
  if (!isLemonSqueezyConfigured) {
    return NextResponse.json(
      { error: "Payments are not configured." },
      { status: 503 },
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated." },
      { status: 401 },
    );
  }

  // Throttle checkout creation per user (5 / minute) to prevent abuse.
  const limit = await rateLimit(`checkout:${user.id}`, {
    limit: 5,
    windowSec: 60,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.resetSec) } },
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const url = await createProCheckout({
      userId: user.id,
      email: user.email ?? "",
      redirectUrl: `${appUrl}/pricing?upgraded=1`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: "Could not create checkout." },
      { status: 500 },
    );
  }
}
