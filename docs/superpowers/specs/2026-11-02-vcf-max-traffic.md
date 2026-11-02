# Vice City Forums Max-Traffic Design

## Intent

Make Vice City Forums the first live proving ground for the Perception traffic engine: detect real GTA VI demand, verify the underlying facts, create something useful, route visitors into a real discussion, and measure whether they become participating members.

The system is not a content-volume bot. Its job is to turn verified demand into durable pages, useful tools, clips, discussions, and returning community activity.

## Success definition

A traffic opportunity is successful only when the intended visitor can actually reach a useful VCF destination and the result can be measured. The primary conversion remains:

**Complete a member profile and join one discussion.**

Primary outcome metrics:

- non-brand organic visits and search impressions
- completed member profiles
- first posts or replies by real members
- real replies per discussion
- seven-day returning members
- channel/campaign attribution where available

Views, follower counts, or generated assets are secondary unless they advance one of the outcomes above.

## Architecture

### Perception / Astra — commander, scout, judge

- monitor first-party GTA VI sources and current public demand
- identify and rank opportunities by freshness, usefulness, likely reach, conversion fit, and confidence
- reject unsupported rumors or label them explicitly as theory
- create one bounded job record per opportunity
- route research/content work to Claude and implementation work to Codex
- verify the completed result before recommending production or distribution
- record outcome metrics back into Perception

### Claude — strategist and research synthesizer

- turn a verified opportunity into a concise content/product brief
- identify audience intent and the best VCF destination type: guide, tracker, comparison, forum prompt, clip concept, or small tool
- preserve source/provenance labels and distinguish facts, observations, and theories
- produce copy/structure recommendations for Codex without changing production directly

### Codex — builder and operator

- implement approved briefs against the VCF repository
- work on review branches and pull requests by default
- add or update tests before behavioral changes
- run the repository quality gates
- prepare deployment-ready changes without merging or deploying unless explicitly approved

### Perception sovereign state

Perception is the source of truth for opportunity records, status, evidence, handoffs, decisions, and outcome metrics. Model chat histories are not canonical state.

Each opportunity record should carry at least:

- `id`
- `detected_at`
- `topic`
- `source_urls`
- `confidence`
- `audience_intent`
- `target_vcf_destination`
- `recommended_asset`
- `claude_brief`
- `codex_task`
- `status`
- `approval_required`
- `published_url` when applicable
- `utm_campaign` when applicable
- measured outcomes

## Opportunity scoring

Prefer opportunities that combine:

1. first-party or highly reliable evidence
2. clear current audience intent
3. an existing VCF page/thread that can be improved quickly, or a useful missing destination
4. a strong reason to discuss, compare, save, or return
5. low risk of misleading visitors
6. measurable acquisition and activation

Do not chase a rumor solely because it is trending.

## Traffic flywheel

1. Astra detects demand or a first-party GTA VI development.
2. Perception verifies evidence and opens one bounded opportunity record.
3. Claude produces the audience/content strategy.
4. Codex builds or updates the VCF destination on a review branch.
5. Astra/Perception checks source fidelity, UX, conversion path, and quality-gate evidence.
6. Kevin approves consequential production publishing, deployment, spend, or other external actions.
7. The destination is distributed with channel-specific attribution.
8. Perception measures visits, completed profiles, posts/replies, and return activity.
9. Winning topics/formats receive more investment; low-conversion formats are revised or retired.

## Guardrails

- No fake users, replies, votes, traffic, or engagement.
- No purchased followers or manufactured community activity.
- No unsupported GTA VI claim may be presented as confirmed.
- Official footage, community work, fan concepts, leaks, and AI-generated media must remain clearly distinguished.
- Preserve creator credit and provenance.
- Do not impersonate Rockstar or imply affiliation.
- Do not merge/deploy production changes, change DNS, publish publicly, spend money, change credentials/permissions, or make production database writes without the required approval.
- Prefer reversible, reviewable work first.

## Current verified starting state — 2026-11-02

- Canonical repository: `DopestT/vicecityforums`.
- Canonical public origin: `https://vicecityforums.com/`.
- Existing discovery pages, sitemap, robots, metadata, and anonymous public reads are operational.
- The largest identified acquisition-to-activation risk was a mobile/guest CTA MutationObserver rewrite loop. A regression test and minimal fix are in draft PR #9, and the repository quality gate passes on the fix.
- Public GTA VI discovery content is stale relative to current first-party updates and needs a source-checked refresh before aggressive promotion.
- Real community activation is currently much weaker than the amount of seeded content, so acquisition should optimize for first real posts/replies rather than raw pageviews alone.

## Phased rollout

### Phase 1 — conversion integrity

Fix the joining path, verify signup/auth/recovery on production after approval, and make every high-traffic page lead clearly to a relevant discussion or membership action.

### Phase 2 — freshness and demand capture

Bring launch-critical GTA VI pages up to current first-party facts, add freshness checks, and create a structured opportunity queue.

### Phase 3 — three-model execution

Run Astra/Perception as manager, Claude as strategist, and Codex as builder against the shared opportunity contract.

### Phase 4 — distribution and learning

Use search/social/referral distribution with attribution, measure real activation, and let Perception continuously re-rank topics and formats by observed performance.

## Non-goals

- maximizing article count for its own sake
- autonomous public posting without a defined approval policy
- creating artificial forum activity
- turning VCF into a generic gaming-news site
- replacing Perception's sovereign state with any model provider's memory
