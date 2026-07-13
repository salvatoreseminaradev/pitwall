"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * "Upgrade to Pro" button.
 * - Anonymous users are sent to /login first.
 * - Authenticated users get a fresh Lemon Squeezy checkout and are redirected.
 */
export default function UpgradeButton({
  isAuthenticated,
  className = "",
  children = "Upgrade to Pro",
}: {
  isAuthenticated: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);

    if (!isAuthenticated) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Checkout unavailable.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={
          className ||
          "w-full rounded-lg bg-f1 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-f1-hover disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {loading ? "Redirecting…" : children}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
