"use client";

import { useRef, useState } from "react";
import Link from "next/link";

/**
 * Wraps a chart and adds a PNG export button (PRO only).
 * Export is done client-side: the rendered <svg> is serialized, drawn onto a
 * canvas with the app's dark background, and downloaded as a PNG.
 */
export default function ExportableChart({
  filename,
  isPro,
  children,
}: {
  filename: string;
  isPro: boolean;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function exportPng() {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    setBusy(true);
    try {
      const rect = svg.getBoundingClientRect();
      const width = Math.ceil(rect.width) || 800;
      const height = Math.ceil(rect.height) || 400;

      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", String(width));
      clone.setAttribute("height", String(height));

      const svgString = new XMLSerializer().serializeToString(clone);
      const svgUrl =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("SVG render failed"));
        img.src = svgUrl;
      });

      const scale = 2; // export at 2x for crispness
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        {isPro ? (
          <button
            type="button"
            onClick={exportPng}
            disabled={busy}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-f1/50 hover:text-white disabled:opacity-50"
          >
            {busy ? "Exporting…" : "⬇ Export PNG"}
          </button>
        ) : (
          <Link
            href="/pricing"
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-f1"
          >
            🔒 Export PNG (PRO)
          </Link>
        )}
      </div>
      <div ref={containerRef}>{children}</div>
    </div>
  );
}
