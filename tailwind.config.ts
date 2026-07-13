import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core dark theme
        background: "#0a0a0a",
        surface: "#141414",
        "surface-hover": "#1c1c1c",
        border: "#262626",
        // F1 accent
        f1: {
          DEFAULT: "#e10600",
          hover: "#ff1a0f",
          muted: "#7a0500",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(225, 6, 0, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
