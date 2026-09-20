# Vice City Forums — Daily Operating Playbook

## Goal

Keep Vice City Forums active, accurate, growing, technically healthy, and ready for GTA 6 traffic.

## Daily production check

1. Run the repository validators:
   - `node scripts/validate-auth.mjs`
   - `node scripts/validate-seo.mjs`
   - `node scripts/validate-clips.mjs`
2. Run `node scripts/verify-production.mjs` against the canonical production origin.
3. Treat any failed canonical-domain, redirect, Supabase-read, sitemap, feed, auth/static, SEO, or clips check as a release blocker.
4. Verify the latest production deployment corresponds to `main` before publishing campaign traffic.

## Community activity

- Maintain at least 30 legitimate staff-started discussion prompts in the launch inventory.
- Seed through the authenticated admin tool; never fabricate users, replies, likes, or community activity.
- Prefer questions that invite specific opinions rather than generic engagement bait.
- Reply substantively to real members and surface strong real responses in later recaps.

## SEO and accuracy

- Re-check dated GTA 6 claims against first-party sources before changing them.
- Regenerate the static discovery pages after a verified factual update.
- Keep the apex `https://vicecityforums.com/` as the canonical origin.
- Keep sitemap, RSS, robots, social metadata, structured data, and internal links passing validation.
- Submit/update the sitemap in Google Search Console and Bing Webmaster Tools when access is available.

## Publishing and acquisition

- Daily mix: one short-form video, one story/poll, one discussion prompt, plus substantive replies to legitimate comments.
- Point posts to the deepest relevant canonical GTA 6 hub, not automatically to the homepage.
- Preserve source/provenance labels for official, user-gameplay, fan-made, and AI-generated clips.
- Never publish an exact or near-duplicate image used by the same brand/channel in the previous 7 days unless explicitly approved.
- Track search impressions, organic clicks, short-form views, completed profiles, posting members, real replies, and 7-day returning members.

## Escalation

Human intervention is required for:
- failed production auth flows;
- failed password recovery or account confirmation;
- admin access failures;
- moderation or rights disputes;
- unverified factual claims;
- Vercel/domain/DNS ownership or account-access problems;
- repeated publication failures after one retry/fallback.
