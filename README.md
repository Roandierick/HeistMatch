# HeistMatch

**The GTA 6 Heist Finder.** Find your crew. Run the heist.

HeistMatch is a matchmaking platform for GTA 6 players who need a crew for a heist. Version 1 has three engines:

1. **Heist Finder**: the product. Browse, filter, join and create heist listings.
2. **Blog / News / Guides**: the SEO and acquisition engine.
3. **E-mail audience**: verified accounts plus an optional, separate marketing opt-in with double opt-in.

HeistMatch is an independent platform and is not affiliated with Rockstar Games or Take-Two Interactive.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4, custom dark design system, no UI library |
| Data / Auth | Supabase (Postgres, Auth, Row Level Security, pg_cron) |
| Validation | Zod 4, on the server for every mutation |
| E-mail | Supabase Auth (account e-mails) + Resend HTTP API (newsletter) |
| Hosting | Vercel |
| Tests | Vitest (unit) + a local Postgres harness for RLS and business rules |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the Supabase keys
npm run dev
```

The app builds and renders without Supabase configured (empty states everywhere), which keeps preview builds green.

### Supabase setup

1. Create a Supabase project (EU region recommended for GDPR).
2. Apply the migrations in `supabase/migrations` in order, with `npx supabase db push` (after `npx supabase link`) or by pasting them into the SQL editor.
3. Optional: load the starter articles from `supabase/seed/blog_starter.sql`. They are **drafts**: verify facts, then publish them in `/admin/posts`.
4. **Auth settings**
   - Enable *Confirm email*.
   - Site URL: your production URL. Redirect URLs: `https://<domain>/auth/callback`, `https://<domain>/auth/confirm`, and your preview domains.
   - Recommended *Confirm signup* template link: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/find` (works across devices).
   - Recommended *Reset password* template link: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/account/password`.
   - Configure custom SMTP (for example Resend) so verification e-mails are not rate limited.
5. Make yourself admin (SQL editor):
   ```sql
   update public.profiles set role = 'admin' where username = 'YourUsername';
   ```

### Sign-up not working?

Run `npm run check:supabase` (locally against the same project, or with the Vercel env vars exported). It reports missing keys, disabled sign-ups and missing migrations. The server log line `[heistmatch:signUp]` shows the exact Supabase error code. The usual causes:

- **No custom SMTP.** Supabase's built-in mailer only sends to members of your Supabase team and only a few e-mails per hour. Everyone else gets `email_address_not_authorized`. Configure SMTP (Resend works) under Authentication -> SMTP.
- **Migrations not applied.** Without them there are no profiles, and the app can't work.
- **Site URL still `http://localhost:3000`.** Verification links then point to localhost. Set the Site URL and Redirect URLs (step 4).

### Local Supabase

`npx supabase start` (needs Docker) runs Auth, Postgres and a mail catcher locally and applies the migrations. Put the printed URL and keys in `.env.local`, then open verification e-mails at http://127.0.0.1:54324.

### Vercel

Set the variables from `.env.example`. Use `NEXT_PUBLIC_SITE_ENV=production` **only** on the production environment: every other environment is `noindex` (meta robots, `X-Robots-Tag` header and a blocking `robots.txt`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run check` | Lint + typecheck + unit tests |
| `npm run test` | Unit tests (validation, filters, moderation, TOC) |
| `npm run test:db` | Applies all migrations to a throwaway local Postgres and runs the RLS/business-rule tests (needs Postgres binaries, run as a non-root user) |
| `npm run check:supabase` | Checks the Supabase project in `.env.local`: keys, sign-up settings, migrations |
| `npm run db:types` | Regenerate Supabase types from the linked project |

## Architecture

```
src/
  app/              Routes (App Router). Public pages are static/ISR; per-user pages are dynamic.
  actions/          Server Actions: all mutations, validated with Zod, authorised by RLS.
  components/       ui/ (design system), layout/, heists/, blog/, newsletter/, account/, admin/, seo/
  config/           site, options (platforms, regions, ...), blog categories
  data/             Read repositories (heists, profiles, blog)
  lib/              supabase clients, auth, validation, moderation, seo, analytics, rate limiting, e-mail
  proxy.ts          Session refresh + auth gate for /account and /admin (Next 16 "proxy", formerly middleware)
supabase/
  migrations/       Schema, triggers/RPCs, RLS, reference data + cron, admin views
  seed/             Draft starter articles
  tests/            Local Postgres harness + security tests
```

### Key decisions

- **Security lives in the database.** Every table has RLS. Business rules that must never be bypassed run in SQL: max 2 active listings and 5 per hour per user, forced host id, protected counters, join/leave through locked RPCs (no overbooking), reviews only between crew mates after the start, users can never change their own role or ban state. Server code only uses the service role for narrow writes (newsletter, analytics, account deletion).
- **Contact details are private.** Gamertags and Discord handles live in `profile_private` and are only returned to members of the same crew through `get_heist_crew_contacts`.
- **Listings expire.** A listing closes 3 hours after its start time. Queries filter on `expires_at`, and a pg_cron job updates statuses every 10 minutes.
- **Heist catalog in the database** (`heist_types`). GTA 6 heists are added by an admin once officially revealed, without a deploy. GTA Online heists make the finder useful before GTA 6 Online.
- **Performance.** Public pages are static or ISR and read Supabase without cookies. The header's auth state is a small client island (`/api/me`), so it doesn't make every page dynamic. No icon, animation or UI libraries; filters and hero search are plain GET forms that work before hydration.
- **Analytics.** First-party and cookie-less (`analytics_events`), with consistent `object_action` event names (`src/lib/analytics/events.ts`). It respects DNT and GPC. Admin dashboard at `/admin/analytics`.
- **Consent.** The marketing opt-in is separate from registration and optional. Signup consent is confirmed when the account e-mail is verified, and standalone signups use double opt-in by e-mail. Version, source and timestamps are stored, with an append-only `consent_events` log. Unsubscribe works by link and in account settings.

### SEO

- Unique title, description and canonical on every indexable page via `pageMetadata()` (`src/lib/seo.ts`).
- JSON-LD: Organization + WebSite (home), BreadcrumbList (all pages with breadcrumbs), Article/NewsArticle (posts). No FAQ schema without real FAQ content.
- `sitemap.xml` contains only canonical, indexable URLs. Categories appear only once they have posts.
- Index/noindex strategy: `/find` is indexable, `/find?…` filter URLs are `noindex,follow` with a canonical to `/find`. Heist listings and player profiles are noindex (short-lived or thin UGC). Blog search is noindex.
- Programmatic SEO (for example `/gta-6-heist-finder/ps5`) is deliberately **not** generated yet. The filter model (`src/lib/filters.ts`) and heist catalog are ready for it once there is enough real data per page.

## Roadmap

| Phase | Status |
| --- | --- |
| 1. Foundation: Next.js, Supabase, auth, database, design system, SEO foundation | ✅ |
| 2. Core Heist Finder: listings, filters, create, join, profiles, responsive UI | ✅ |
| 3. Content engine: blog, articles, categories, internal linking, sitemap, structured data, newsletter | ✅ |
| 4. Reputation: completed heists, reviews, play-again, basic rating | ✅ basic version |
| 5. Growth: dedicated SEO landing pages, e-mail automation, referrals, sharing | Next |
| 6. Monetization: HeistMatch Pro, ads, affiliates, sponsorships | Later |

## Before launch

- [ ] Fill in legal entity details (`NEXT_PUBLIC_LEGAL_*`) and have the legal pages reviewed.
- [ ] Configure Supabase Auth SMTP + templates and Resend domain (SPF/DKIM/DMARC).
- [ ] Verify and publish the starter articles.
- [ ] Connect Google Search Console and submit `sitemap.xml`.
- [ ] Run Lighthouse on `/`, `/find` and an article page on the production URL.
