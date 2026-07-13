/**
 * Minimal Lemon Squeezy REST helper (no SDK dependency).
 * Docs: https://docs.lemonsqueezy.com/api
 */

export const lemonSqueezyConfig = {
  apiKey: process.env.LEMONSQUEEZY_API_KEY ?? "",
  storeId: process.env.LEMONSQUEEZY_STORE_ID ?? "",
  variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID ?? "",
  webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "",
};

export const isLemonSqueezyConfigured =
  lemonSqueezyConfig.apiKey.length > 0 &&
  lemonSqueezyConfig.storeId.length > 0 &&
  lemonSqueezyConfig.variantId.length > 0;

const API = "https://api.lemonsqueezy.com/v1";

/**
 * Create a hosted checkout for the PRO plan.
 * The user's id + email are stored in `custom` so the webhook can match the
 * completed order back to the right profile.
 */
export async function createProCheckout(params: {
  userId: string;
  email: string;
  redirectUrl: string;
}): Promise<string> {
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: params.email,
          custom: { user_id: params.userId },
        },
        product_options: {
          redirect_url: params.redirectUrl,
        },
      },
      relationships: {
        store: {
          data: { type: "stores", id: lemonSqueezyConfig.storeId },
        },
        variant: {
          data: { type: "variants", id: lemonSqueezyConfig.variantId },
        },
      },
    },
  };

  const res = await fetch(`${API}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${lemonSqueezyConfig.apiKey}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lemon Squeezy checkout failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    data?: { attributes?: { url?: string } };
  };
  const url = json.data?.attributes?.url;
  if (!url) throw new Error("Lemon Squeezy did not return a checkout URL.");
  return url;
}
