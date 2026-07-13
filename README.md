<div align="center">

# 🏁 PitWall

### The Formula 1 pit wall, one click away.

Real‑time **F1 statistics** — driver standings, race results, lap times, telemetry & team radio — on desktop and mobile.

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Recharts](https://img.shields.io/badge/Recharts-Charts-FF6384?logo=chartdotjs&logoColor=white)](https://recharts.org/)
[![Data: OpenF1](https://img.shields.io/badge/Data-OpenF1-E10600)](https://openf1.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

> **PitWall** is an unofficial fan project. It is not affiliated with, endorsed by, or connected to Formula One Group, FIA, or any F1 team. All data is sourced from [OpenF1](https://openf1.org), an open‑source public feed.

## ✨ Features

| | |
|---|---|
| 🏆 **Standings** | Real championship standings (points, wins, podiums) aggregated from race **and sprint** results. |
| 👤 **Driver profiles** | Season stats + points‑per‑race chart. |
| 🏎️ **Races** | Season calendar with winners; each race has a detail page with **5 tabs**. |
| 📊 **Race tabs** | Results · Laps (sortable) · **Telemetry** (speed/throttle/brake/gear) · Weather · Team Radio (audio). |
| ⚔️ **Comparator** | Head‑to‑head driver comparison. |
| 🔐 **Auth** | Email + password sign in / sign up (Supabase). |
| 💎 **FREE / PRO** | FREE: current season, top 5, basic charts. PRO: full history, advanced comparator, PNG export, race notifications. |
| 💳 **Payments** | Lemon Squeezy checkout; a signed webhook flips `is_pro`. |

## 🧰 Tech Stack

| Area | Technology |
| ---- | ---------- |
| Framework | **Next.js 14** (App Router, server components) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** (dark theme, F1 red accents) |
| Charts | **Recharts** |
| F1 data | **OpenF1 API** (server‑side fetch) |
| Auth / DB | **Supabase** |
| Payments | **Lemon Squeezy** |
| Rate limiting | **Upstash Redis** (optional) |
| Hosting | **Vercel** (+ Cron) |

## 🏗️ Architecture highlights

**Standings pipeline** — OpenF1 has no "standings" endpoint, so [`src/lib/openf1.ts`](src/lib/openf1.ts) builds it: list race + sprint sessions, sum `session_result` per driver, record points‑per‑race. Mid‑season, future rounds are skipped; partial (rate‑limited) results are never cached.

**Layered caching** — the aggregated season is served fastest‑first:

```
React cache (per render)
  → unstable_cache (in‑memory: 30 min current / 1 week past seasons)
    → Supabase  season_cache  (persistent, survives restarts & deploys)
      → OpenF1 (source, only on a full miss)
```

A Vercel Cron ([`vercel.json`](vercel.json)) keeps the current season fresh; `GET /api/health` reports Supabase reachability and per‑season cache age.

## 🚀 Getting started

Requires **Node.js 18.17+**.

```bash
git clone https://github.com/<your-username>/pitwall.git
cd pitwall
npm install          # .npmrc pins legacy-peer-deps, so this just works
npm run dev
```

Open **http://localhost:3000**. The app runs **with zero config** as a public FREE tier — F1 data is public, and auth/payments simply stay disabled until you add credentials.

> 💡 Preview PRO features locally: set `NEXT_PUBLIC_FORCE_PRO=true` in `.env.local` (dev only).

## 🔑 Environment

Copy the template and fill in what you need — every block is optional and unlocks a feature:

```bash
cp .env.local.example .env.local
```

| Block | Unlocks |
| ----- | ------- |
| `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_SERVICE_ROLE_KEY` | Auth, profiles, persisted standings |
| `LEMONSQUEEZY_*` | PRO checkout + webhook |
| `CRON_SECRET` | Standings refresh endpoint |
| `UPSTASH_REDIS_REST_*` | Distributed rate limiting |

## ☁️ Deploy on Vercel

1. Push to GitHub, then **Import** the repo on [vercel.com/new](https://vercel.com/new) (Next.js is auto‑detected).
2. Add the environment variables in **Project → Settings → Environment Variables**.
3. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor.
4. In **Supabase → Auth**, enable **Confirm email**.
5. Point a Lemon Squeezy webhook at `/api/webhooks/lemonsqueezy`.
6. Seed the standings once:
   ```bash
   curl -X POST "https://<your-domain>/api/cron/refresh-standings?all=1" \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

The Cron in `vercel.json` then keeps the current season fresh automatically.

## 🔒 Security

- Only `NEXT_PUBLIC_*` keys reach the browser; service‑role key, payment secrets and `CRON_SECRET` are server‑only.
- **No self‑upgrade to PRO**: `profiles` RLS + column grants let users update only `race_notifications`; `is_pro` is writable solely by the signature‑verified Lemon Squeezy webhook.
- Scoped **Content‑Security‑Policy**, HSTS, `X‑Frame‑Options: DENY`, `nosniff`, `Referrer‑Policy`, `Permissions‑Policy` ([`next.config.js`](next.config.js)).
- `/api/checkout` is rate‑limited per user.

## 🗺️ Roadmap

- [x] Persist standings to Supabase for instant cold loads
- [x] Sprint points in the championship standings
- [x] Production hardening (RLS, CSP, rate limiting)
- [ ] Race notifications delivery (email / push)
- [ ] More historical seasons as OpenF1 backfills data

## 📄 License

MIT — free to use, learn from, and build on.

<div align="center">

Made with ❤️ and too much espresso · Data by [OpenF1](https://openf1.org)

</div>
