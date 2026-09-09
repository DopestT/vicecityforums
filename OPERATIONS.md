# Vice City Forums — Operations Source of Truth

Last verified: 2026-09-09

## Canonical production stack

- **Source repository:** `DopestT/vicecityforums`
- **Canonical public origin:** `https://vicecityforums.com/`
- **Primary production host:** Vercel
- **Canonical host policy:** apex `.com`; `www.vicecityforums.com`, `vicecityforums.net`, and `www.vicecityforums.net` permanently redirect to it
- **Repository mirror / fallback:** GitHub Pages via `.github/workflows/pages.yml`
- **GitHub Pages path:** `https://dopestt.github.io/vicecityforums/`
- **Supabase project:** `Vice City Forums`
- **Supabase project ref:** `mzqplhhtsnahxghxpwcd`
- **Supabase URL:** `https://mzqplhhtsnahxghxpwcd.supabase.co`
- **Database region:** `us-east-1`
- **Database status:** ACTIVE_HEALTHY when verified

## Forum database

Public application tables:

- `profiles`
- `categories`
- `threads`
- `replies`

## Authentication and admin

Authentication is handled by Supabase Auth.

The production admin console is `admin.html`. It validates the current Supabase session, loads the matching `profiles` row, and requires `is_admin = true` before exposing moderation controls.

Do not create a second forum auth system or a second Supabase project for this site unless migration is explicitly planned.

## Current frontend wiring

`index.html` loads `js/backend-bootstrap.js`, which preserves password-recovery intent and loads the application module. `js/app.js` is wired directly to the canonical Supabase project and exposes its client for the admin-state layer.

## Deployment

Pushes to `main` publish the repository through the configured Vercel project and also trigger `.github/workflows/pages.yml` for the GitHub Pages mirror. All public metadata, sitemaps, feed URLs, auth callbacks, and social links must use `https://vicecityforums.com/`.

`vercel.json` consolidates the `.com` and `.net` host variants onto the apex `.com`, adds baseline browser security headers, and adds `X-Robots-Tag` headers to private utility pages.

The public discovery layer contains 13 indexable routes: the forum homepage plus verified hubs for news, release date, pre-orders, gameplay, PC status, characters, map locations, vehicles, trailers, funny clips, the forum directory, and a live release countdown. Run both scripts before every content deployment:

```bash
node scripts/build-seo-pages.mjs
node scripts/validate-seo.mjs
```

The validator checks unique titles/descriptions, canonicals, index directives, social metadata, JSON-LD, minimum source depth, local links, and exact sitemap coverage.

## Email

Brevo is the intended email layer for forum lifecycle/marketing mail. Keep these concerns separate:

- Supabase Auth: account confirmation, login session, password recovery
- Brevo: welcome/onboarding, community/newsletter, growth campaigns, administrative notifications where appropriate

Brevo integration still requires an end-to-end verification pass.

## Database growth foundation

Migration `forum_growth_foundation` was applied on 2026-09-09 and is tracked at `supabase/forum_growth_foundation.sql`. It:

- synchronizes thread reply totals and last-activity timestamps on reply insert, update, and delete;
- prevents ordinary members from editing forum-managed moderation, authorship, demo, count, and timestamp fields;
- blocks member replies to locked threads at the policy layer;
- adds author foreign-key indexes; and
- removes the current RLS init-plan and redundant-category-policy advisor findings.

## Security / performance follow-up

The 2026-09-09 performance advisor has no actionable warnings after the growth migration. It reports the two new author indexes as unused information because they have not yet accumulated production query traffic.

One security warning remains: enable leaked-password protection in Supabase Auth. That setting is managed in the Supabase dashboard rather than this repository.

## Next work order

1. Verify login, logout, password recovery, account confirmation, and admin access on production.
2. Verify Brevo integration end-to-end.
3. Submit `https://vicecityforums.com/sitemap.xml` in the verified Google Search Console and Bing Webmaster Tools properties.
4. Publish the launch distribution kit in `GROWTH.md` through the approved GTA social profiles, linking each post to its matching canonical hub rather than sending every post to the homepage.
5. Re-check official sources whenever a dated fact changes and regenerate the site before distribution.

## Rule

When there is conflicting information elsewhere, this file and the verified production configuration should be treated as the operational source of truth until deliberately updated.
