# Vice City Forums — Operations Source of Truth

Last verified: 2026-09-05

## Canonical production stack

- **Source repository:** `DopestT/vicecityforums`
- **Production host:** GitHub Pages
- **Deploy workflow:** `.github/workflows/pages.yml`
- **Production site path:** `https://dopestt.github.io/vicecityforums/`
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

`index.html` loads `js/backend-bootstrap.js`.

That bootstrap currently rewrites the older Supabase URL/key embedded in `js/app.js` to the canonical production Supabase project at runtime and adds the admin-state layer. This works, but it is a temporary compatibility shim and should be removed after `js/app.js` is updated directly.

## Deployment

Pushes to `main` trigger `.github/workflows/pages.yml`, which publishes the repository through GitHub Pages.

The latest verified deployment workflow completed successfully on 2026-09-05.

**Vercel is not the current canonical host for this repository.** Do not troubleshoot forum production through a Vercel project unless hosting is intentionally migrated there.

## Email

Brevo is the intended email layer for forum lifecycle/marketing mail. Keep these concerns separate:

- Supabase Auth: account confirmation, login session, password recovery
- Brevo: welcome/onboarding, community/newsletter, growth campaigns, administrative notifications where appropriate

Brevo integration still requires an end-to-end verification pass.

## Security / performance follow-up

Supabase advisor findings from the 2026-09-05 verification:

- Enable leaked-password protection in Supabase Auth.
- Add covering indexes for `replies.author_id` and `threads.author_id` when appropriate.
- Optimize RLS policies that repeatedly evaluate `auth.*` functions per row.
- Review overlapping permissive SELECT policies on `categories`.

These performance findings are not evidence of the earlier sign-in failure.

## Next work order

1. Remove the runtime Supabase rewrite shim by updating `js/app.js` directly to the canonical project.
2. Preserve the working admin session / `is_admin` behavior.
3. Verify login, logout, password recovery, account confirmation, and admin access on production.
4. Verify Brevo integration end-to-end.
5. Add the custom Vice City Forums domain after auth redirect URLs are confirmed.
6. Only then connect the social/content automation funnel and GTA account bots.

## Rule

When there is conflicting information elsewhere, this file and the verified production configuration should be treated as the operational source of truth until deliberately updated.
