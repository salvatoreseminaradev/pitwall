import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { lemonSqueezyConfig } from "@/lib/lemonsqueezy";

// Webhooks must read the raw body for signature verification.
export const dynamic = "force-dynamic";

/** Timing-safe HMAC-SHA256 verification of the raw payload. */
function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !lemonSqueezyConfig.webhookSecret) return false;
  const digest = crypto
    .createHmac("sha256", lemonSqueezyConfig.webhookSecret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(signature, "hex"),
    );
  } catch {
    return false;
  }
}

// Events that should grant / keep PRO access.
const ACTIVATING = new Set([
  "order_created",
  "subscription_created",
  "subscription_updated",
  "subscription_resumed",
  "subscription_unpaused",
]);

// Events that should revoke PRO access.
const DEACTIVATING = new Set([
  "subscription_expired",
  "subscription_cancelled",
]);

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!verifySignature(rawBody, request.headers.get("x-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    meta?: { event_name?: string; custom_data?: { user_id?: string } };
    data?: { attributes?: { status?: string; customer_id?: number } };
  };

  const eventName = payload.meta?.event_name ?? "";
  const userId = payload.meta?.custom_data?.user_id;

  if (!userId) {
    // Nothing to reconcile without our user id — acknowledge to avoid retries.
    return NextResponse.json({ received: true, note: "no user_id" });
  }

  let isPro: boolean | null = null;
  if (ACTIVATING.has(eventName)) isPro = true;
  else if (DEACTIVATING.has(eventName)) isPro = false;

  if (isPro === null) {
    return NextResponse.json({ received: true, ignored: eventName });
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({
        is_pro: isPro,
        lemon_squeezy_customer_id:
          payload.data?.attributes?.customer_id?.toString() ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;
  } catch (err) {
    console.error("[lemonsqueezy webhook]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true, event: eventName, isPro });
}
