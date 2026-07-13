# Graph Report - .  (2026-07-13)

## Corpus Check
- Corpus is ~18,578 words - fits in a single context window. You may not need a graph.

## Summary
- 335 nodes · 621 edges · 20 communities (16 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Pages & Routing
- Race Detail Tabs
- Product Concepts & Features
- OpenF1 Data Fetching
- TypeScript / Build Config
- Dependencies (package.json)
- Payments, Account & Rate Limiting
- Dev Tooling & Lint
- Footer, Privacy & Contact
- Loading States
- Charts & Chart Export
- Auth Middleware & Security
- Security Headers (next.config)
- Vercel Cron Config
- Tailwind Config
- GET Handler
- POST Handler

## God Nodes (most connected - your core abstractions)
1. `getProfile` - 20 edges
2. `resolveSeason()` - 17 edges
3. `compilerOptions` - 16 edges
4. `seasonHref()` - 13 edges
5. `loadSeason()` - 11 edges
6. `useOpenF1()` - 10 edges
7. `formatDate()` - 9 edges
8. `getSeason` - 8 edges
9. `getStandings()` - 8 edges
10. `api()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Sprint points in standings` --references--> `loadSeason()`  [INFERRED]
  README.md → src/lib/openf1.ts
- `FREE / PRO tiers` --references--> `getProfile`  [INFERRED]
  README.md → src/lib/auth.ts
- `Layered standings cache` --references--> `loadSeason()`  [INFERRED]
  README.md → src/lib/openf1.ts
- `Race notifications` --conceptually_related_to--> `readSeasonCache()`  [INFERRED]
  README.md → src/lib/standings-store.ts
- `Supabase (auth + DB)` --references--> `updateSession()`  [INFERRED]
  README.md → src/lib/supabase/middleware.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **PRO monetization flow** — readme_free_pro_tiers, readme_lemon_squeezy, readme_security_hardening, src_lib_auth_getprofile [INFERRED 0.75]
- **Standings data pipeline** — readme_openf1_api, readme_standings_cache, readme_sprint_points, src_lib_openf1_getseason [INFERRED 0.85]

## Communities (20 total, 4 thin omitted)

### Community 0 - "App Pages & Routing"
Cohesion: 0.08
Nodes (39): ComparePage(), metadata, DriverProfilePage(), generateMetadata(), DriversPage(), metadata, inter, metadata (+31 more)

### Community 1 - "Race Detail Tabs"
Cohesion: 0.09
Nodes (29): BestLapRow, LapsTab(), SortDir, SortKey, TabId, TABS, TabEmpty(), TabError() (+21 more)

### Community 2 - "Product Concepts & Features"
Cohesion: 0.08
Nodes (25): Chart export (PNG), FREE / PRO tiers, OpenF1 API, Race notifications, Season configuration & gating, Sprint points in standings, Layered standings cache, GET() (+17 more)

### Community 3 - "OpenF1 Data Fetching"
Cohesion: 0.13
Nodes (25): handler(), api(), getLaps(), getMeetings(), getRaceSessions(), getSessionDrivers(), getSessionResult(), loadSeason() (+17 more)

### Community 4 - "TypeScript / Build Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, ./src/*, **/*.ts (+20 more)

### Community 5 - "Dependencies (package.json)"
Cohesion: 0.09
Nodes (21): next, dependencies, next, react, react-dom, recharts, @supabase/ssr, @supabase/supabase-js (+13 more)

### Community 6 - "Payments, Account & Rate Limiting"
Cohesion: 0.15
Nodes (17): Lemon Squeezy (payments), Checkout rate limiting, Upstash Redis (rate limiting), AccountPage(), metadata, POST(), createProCheckout(), getNextRace() (+9 more)

### Community 7 - "Dev Tooling & Lint"
Cohesion: 0.11
Nodes (19): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+11 more)

### Community 8 - "Footer, Privacy & Contact"
Cohesion: 0.19
Nodes (5): metadata, ContactForm(), DataDisclaimer(), links, SITE

### Community 9 - "Loading States"
Cohesion: 0.26
Nodes (3): CardGridSkeleton(), ListSkeleton(), Skeleton()

### Community 11 - "Charts & Chart Export"
Cohesion: 0.33
Nodes (5): LapTimesChart(), ResultsTab(), formatGap(), formatLapTime(), LapTrace

### Community 12 - "Auth Middleware & Security"
Cohesion: 0.31
Nodes (7): Security hardening (RLS + CSP), Supabase (auth + DB), CookieToSet, PROTECTED_PREFIXES, updateSession(), config, middleware()

### Community 13 - "Security Headers (next.config)"
Cohesion: 0.50
Nodes (3): csp, nextConfig, securityHeaders

## Knowledge Gaps
- **93 isolated node(s):** `csp`, `securityHeaders`, `nextConfig`, `name`, `version` (+88 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getProfile` connect `App Pages & Routing` to `Product Concepts & Features`, `Payments, Account & Rate Limiting`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `FREE / PRO tiers` connect `Product Concepts & Features` to `App Pages & Routing`, `Auth Middleware & Security`, `Payments, Account & Rate Limiting`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Payments, Account & Rate Limiting` to `App Pages & Routing`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `loadSeason()` (e.g. with `Sprint points in standings` and `Layered standings cache`) actually correct?**
  _`loadSeason()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `csp`, `securityHeaders`, `nextConfig` to the rest of the system?**
  _93 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.07909604519774012 - nodes in this community are weakly interconnected._
- **Should `Race Detail Tabs` be split into smaller, more focused modules?**
  _Cohesion score 0.08748615725359911 - nodes in this community are weakly interconnected._