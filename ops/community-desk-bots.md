# VCF Community Desk — bot-ready editorial operating plan

**Project:** Vice City Forums only (DopestT/vicecityforums). Separate from LMTYAI, Blue Tsunami, ANGELS, AIrwave and all other brands.

**Status as of 2026-11-19:** The homepage section "Today on the Wire" is a curated editorial surface. It does **not** represent automated posting, live online users, or artificially generated engagement. The four desk concepts below are proposed operating roles; no autonomous bot accounts, background content scheduler, API keys, or live publishing are activated by this PR.

## Desk roles (proposed activation behind separate publishing approval)

| Desk | Useful work | Source / user action | Attribution |
| --- | --- | --- | --- |
| News Desk | Discover official GTA VI announcements, preserve source link and observation date, draft concise summary | Rockstar first-party source link | Clearly "VCF News Bot · AI-assisted" if published by bot |
| Community Host | Draft a fresh open question and invite real people to respond | Relevant forum category; human replies only | Clearly "VCF Community Bot · Automated prompt" |
| Clip Desk | Feature submissions from genuine members with permission and provenance | Existing clip submission process; no scraped reposts without rights | Separate creator credit from bot curator attribution |
| Guide Desk | Explain sourced gameplay/locations/characters and label community speculation | Canonical VCF guide with direct official citations | Clearly "VCF Guide Bot · AI-assisted" |
| Moderation Desk | Triage suspected spam, unsafe content, spoilers and questionable sources for review | Review queue, conservative false-positive handling | Internal automation; no impersonation or invisible removals |

## Publication and community integrity rules

1. **No simulated community:** never generate fictitious members, sockpuppet accounts, artificial replies, hearts, concurrent viewers, review counts, follower counts, false timestamps or invented testimonials.
2. **Bot identity is explicit:** each bot-produced public post must be distinguishable from members by name and a visible label. A static card is not a claim that a bot posted it.
3. **Use real evidence:** attach original source URLs for news. Do not publish unverified spoilers, fan art as official game screenshots, or stale dates as current.
4. **Protect live accounts and member data:** no privileged service-role credentials in client-side JS or repository files. Server-side posting must use least privilege, approval scope and audit logs.
5. **Avoid flooding:** prefer a small number of high-value prompts and verified updates. Do not bump threads merely to fake momentum.
6. **Preserve genuine engagement:** read only actual member threads for real activity. Keep any demo content explicitly labeled and separate.
7. **Approval boundary:** content publishing, permissions, provider billing, credential changes, merges and production deployments require the explicit project-specific approval already required by the persistent project guide.

## Next technical steps, not yet activated

- Create an auditable VCF-only editorial queue, deduplicated by source URL and prompt/topic; store verified source, detection time, draft, reviewer, status and target category.
- Use existing VCF Agent Checks and paused VCF Content workflow as references to avoid duplicate or accidental resumption. Do not enable the paused content automation without an explicit request.
- After separately approved identity and publication settings are provisioned, publish through limited-scope VCF bot accounts with visible attribution, not a browser using the owner's admin session.
- Track actual signed-up members, authentic replies and genuine clicks; report unknowns rather than estimates.

## Acceptance criteria for this UI change

- The public "1 / 100 claimed" banner is not rendered by the founding decorator; real profile accounts and optional individual founder badges remain unchanged.
- The dynamic homepage leads with useful curated topics (news, community discussion, clips, guides), each with a working destination and accurate editorial labeling.
- The thread list displays only real query results and existing clearly marked demo entries; no fake conversation counts.
- A backend-read failure does not hide all curated guide content.
- Responsive mobile cards, keyboard focus states and existing login/signup remain functional.
- Static validations and Vercel preview pass; obtain explicit release approval before merging or deploying.
