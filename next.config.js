/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy scoped to the exact external hosts the app uses:
//  - images: F1 media (flags, headshots)
//  - audio: F1 live-timing (team radio)
//  - fetch/XHR: OpenF1 (client tabs) + Supabase (auth)
// Dev additionally needs 'unsafe-eval' and ws: for React Fast Refresh / HMR.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://media.formula1.com https://*.formula1.com",
  "media-src 'self' https://livetiming.formula1.com https://*.formula1.com",
  `connect-src 'self' https://api.openf1.org https://*.supabase.co${
    isDev ? " ws: wss:" : ""
  }`,
  "font-src 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework/version.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
