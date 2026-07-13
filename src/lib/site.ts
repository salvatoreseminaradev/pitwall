/** Site-wide constants shared by the footer, privacy page and data disclaimers. */
export const SITE = {
  name: "PitWall",
  tagline: "F1 data for real fans",
  contactEmail: "salvatore.seminara@solutionnow.it",
  social: {
    x: "https://x.com",
    reddit: "https://reddit.com",
  },
  /** Full legal disclaimer (footer + privacy page). */
  disclaimer:
    "PitWall is an unofficial fan project and is not affiliated with, endorsed by, or connected to Formula One Group, FIA, or any F1 team. All data is sourced from OpenF1, an open-source public feed.",
} as const;
