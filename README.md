# 🐰 Habit Rabbit

A habit tracker built to feel like a friend, not a coach. Add the tiny things you'd like to do
more of, check them off when it feels good, and look back at your week without being scored.

**No streaks. No XP. No leaderboards. No "you missed it".** One check-off is celebrated exactly as
much as ten.

---

## What's inside

| Area | What it does |
| --- | --- |
| **Today** (`/today`) | Create, edit, delete and check off habits for today. Live search, per-habit emoji + colour, kind empty states. |
| **Week** (`/week`) | Monday-start grid (desktop/tablet) and day cards (mobile). Tick or un-tick any past day. CSV export. |
| **Insights** (`/insights`) | Four-week bar chart, 14-day line chart, per-habit breakdown, and a **weekly report you generate on request** with an explicit consent toggle. |
| **Profile** (`/profile`) | Display name, time zone, reminder + report-keeping toggles (off by default), theme choice, sign out, demo reset. |
| **Admin** (`/admin`) | Role-gated (`admin` / `moderator`): searchable, sortable member table with inline role changes, plus the contact-message inbox. Counts only — never habit content. |
| **Contact** (`/contact`) | Validated contact form with a honeypot, server-side validation, toast feedback, staff inbox. |
| **Auth** (`/sign-in`) | Google OAuth via Supabase, or a local demo session so the app is usable with zero configuration. |

Everything else you'd expect is there: dark mode (no flash), toasts, skeletons and loading states,
custom 404/500, `robots.txt`, `sitemap.xml`, a dynamic OG image, PWA manifest, Umami analytics,
and accessible semantics throughout (skip link, focus rings, `aria-pressed`, `aria-live`,
reduced-motion support).

---

## Stack

- **Next.js 15** (App Router, Server Components, route handlers) + **React 19**
- **Tailwind CSS 3** with a pastel design-token layer (`src/app/globals.css`)
- **Supabase** (Postgres + Auth + RLS) — optional, see below
- **Recharts** for the charts, **lucide-react** for icons, **date-fns** available for date math
- **Umami** for privacy-friendly analytics

```
src/
├── app/
│   ├── api/                # habits, logs, notifications, profile, report, contact, admin, auth
│   ├── auth/callback/      # Google OAuth code exchange
│   ├── today|week|insights|profile|admin|contact|sign-in/
│   ├── opengraph-image.tsx # dynamic OG image (ImageResponse)
│   ├── error.tsx · not-found.tsx · global-error.tsx · loading.tsx
│   └── layout.tsx · page.tsx (marketing) · sitemap.ts · robots.ts · manifest.ts
├── components/
│   ├── Rabbit.tsx          # the mascot, inline SVG with moods
│   ├── ThemeProvider / ThemeToggle / ThemeScript
│   ├── ToastProvider / Celebration / ConfirmDialog
│   ├── NavBar / NotificationsBell / Logo
│   └── app/                # TodayBoard, WeekBoard, InsightsBoard, ProfileForm, AdminDashboard…
└── lib/
    ├── data.ts             # getSession() + getAppData() + getStaffOverview()
    ├── supabase.ts         # server clients (cookie-bound + service role)
    ├── demo-store.ts       # the zero-config local backend
    ├── types.ts · utils.ts · report.ts
```

---

## Run it locally

```bash
npm install
cp .env.example .env.local     # all values optional
npm run dev                    # http://localhost:3100
```

Open the site, press **Get started** → **Continue without an account**. You'll get a demo profile
with four sample habits and three weeks of history so every screen has something to show.

> **Demo mode** stores everything in `.data/habit-rabbit-demo.json` (or `/tmp` on Vercel) and
> identifies you with an `hr_demo_user` cookie. It's for trying the app — data does not survive a
> redeploy on serverless hosting.

---

## Connect Supabase (real accounts, Google login, persistent data)

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/0001_init.sql` in the SQL editor. It creates six tables —
   `profiles`, `habits`, `habit_logs`, `notifications`, `contact_messages`, `weekly_reports` —
   the `handle_new_user` trigger that fills `profiles` on first Google sign-in, and RLS policies
   (owners see their own rows; `admin`/`moderator` see counts and contact messages).
3. **Authentication → Providers → Google**: add your OAuth client ID/secret, and set the callback
   to `https://<project>.supabase.co/auth/v1/callback`.
4. **Authentication → URL Configuration**: Site URL = your site, Redirect URLs include
   `http://localhost:3100/auth/callback` and `https://<your-domain>/auth/callback`.
5. Fill in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-only, used by the contact form
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

6. Restart. Every route switches from demo mode to Supabase automatically — there is no code to
   change. To make yourself an admin:

   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

Optional: `supabase/migrations/0002_seed.sql` gives a signed-in account three sample habits.

---

## Deploy to Vercel

```bash
npm i -g vercel     # once
vercel              # preview deploy
vercel --prod       # production
```

Add the same environment variables in **Project → Settings → Environment Variables**, then set
`NEXT_PUBLIC_SITE_URL` to the production domain (used for canonical URLs, OG images and the
sitemap). `vercel.json` already sets sensible security headers. Nothing else is required — the
build is plain `next build`.

## Analytics (Umami)

Set `NEXT_PUBLIC_UMAMI_WEBSITE_ID` (and `NEXT_PUBLIC_UMAMI_SRC` for self-hosted) and the script is
loaded with `next/script` after hydration. No cookies, no personal data, and the app sends a single
`app_error` event from the error boundary.

---

## Design notes

- **Palette**: primary `#E879F9`, secondary `#38BDF8`, accent `#FBBF24`, background `#FDF4FF`,
  text `#1E1B4B`, with a matching `night` set for dark mode.
- **Type**: Baloo 2 for display, Nunito for body — rounded, friendly, still legible at 14px.
- **Motion**: `hop-in`, `pop-check`, `float-slow`, `wiggle`, `fade-up`; every one is disabled under
  `prefers-reduced-motion`.
- **Mobile first**: single-column stacked cards under `md`, the week grid takes over from `md`, and
  charts reflow with `ResponsiveContainer`.
- **Anti-gamification is enforced in code**: `habit_logs` stores one row per habit per day and
  nothing computes a streak, a longest run, or a broken chain anywhere in the codebase.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on port 3100 |
| `npm run build` | Production build |
| `npm start` | Serve the production build on port 3100 |
| `npm run lint` | ESLint (`next lint`) |
