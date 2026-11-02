# Vice City Forums Max-Traffic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Vice City Forums into the first measurable Perception traffic engine, with a reliable member-conversion path, current source-first GTA VI discovery pages, and bounded Astra/Claude/Codex handoffs.

**Architecture:** Perception/Astra owns opportunity detection, routing, verification, and outcome state; Claude produces strategy briefs; Codex implements reviewable repository changes. VCF remains source-first and measures traffic through real member activation rather than manufactured engagement.

**Tech Stack:** Static HTML/CSS/JavaScript, Supabase Auth/database, Node.js validation/build scripts, GitHub Actions, Vercel, Perception orchestration state.

**Spec:** `docs/superpowers/specs/2026-11-02-vcf-max-traffic.md`

## Global Constraints

- Canonical repository: `DopestT/vicecityforums`; canonical public origin: `https://vicecityforums.com/`.
- Primary conversion: complete a member profile and join one discussion.
- No fake users, replies, votes, traffic, or engagement.
- Confirmed GTA VI claims require first-party or equivalent direct evidence; theory remains labeled.
- Official, community, fan-made, leaked, and AI-generated media remain distinguishable.
- Perception is the canonical opportunity/task/outcome store; provider chat history is not.
- Production merge/deploy, DNS, public publishing, spend, credentials/permissions, and production database writes require the applicable explicit approval.
- Behavioral fixes use test-first development and must pass the existing repository quality gate.

## Review Focus

- Repeated DOM decoration must not cause a MutationObserver feedback loop or degrade the guest signup experience.
- Stale source dates must not be presented as current verification dates.
- New first-party GTA VI updates must not erase source/provenance distinctions or convert observation into fact.
- A traffic opportunity must always identify a concrete VCF destination and measurable conversion path rather than generating generic content.
- Missing analytics or model/provider access must be reported as unavailable, not inferred as healthy or successful.

---

### Task 1: Stop the guest/mobile signup CTA observer loop

**Files:**
- Modify: `scripts/validate-auth.mjs`
- Modify: `js/founding-citizens.js`

**Interfaces:**
- Consumes: existing `campaignState()` and `#mobile-auth-cta` DOM element.
- Produces: idempotent `decorateMobileCta()` behavior that only mutates text when the desired label changes.

- [x] **Step 1: Add a failing validation for idempotent CTA decoration**

Require the source to compute one stable label and guard the text assignment with a value comparison.

- [x] **Step 2: Run the pull-request quality gate and verify RED**

Expected: `Validate auth and operations` fails because the guard does not yet exist.

- [x] **Step 3: Implement the minimal idempotent CTA change**

In `decorateMobileCta()`, derive `label` from `campaignState().full` and assign `cta.textContent` only when it differs.

- [x] **Step 4: Run the complete quality gate and verify GREEN**

Expected: discovery generation, auth validation, SEO validation, clips validation, and generated-file cleanliness all pass.

- [x] **Step 5: Keep the fix in draft PR #9 pending production approval and live-path verification**

---

### Task 2: Refresh launch-critical GTA VI discovery facts

**Files:**
- Modify: `scripts/validate-seo.mjs`
- Modify: `scripts/build-seo-pages.mjs`
- Generated/verify: `gta-6-news/index.html`
- Generated/verify: `gta-6-trailers/index.html`
- Generated/verify: `gta-6-release-date/index.html`
- Generated/verify: `gta-6-pc/index.html`
- Generated/verify: `feed.xml`
- Generated/verify: `sitemap.xml`
- Generated/verify: `llms.txt`

**Interfaces:**
- Consumes: current first-party Rockstar GTA VI home/media/news/store sources.
- Produces: generated pages whose visible checked date and latest-update claims match the source-checked snapshot used by the builder.

- [ ] **Step 1: Add freshness assertions to `scripts/validate-seo.mjs`**

For the current verified snapshot, assert that the news/trailer outputs include the current major-video count, Launch Trailer date, latest first-party news item/date, and current verification date.

- [ ] **Step 2: Run the PR quality gate and verify RED**

Expected: SEO validation or generated-file check fails against the September snapshot.

- [ ] **Step 3: Update the builder's source snapshot and affected page copy**

Keep release/platform/preload statements tied to current first-party sources; add the newer official video/news items; remove stale `as of September 9, 2026` language where it claims current status.

- [ ] **Step 4: Regenerate all builder-owned discovery files**

Run: `node scripts/build-seo-pages.mjs`

- [ ] **Step 5: Run the complete quality gate and verify GREEN**

Run the existing GitHub Actions quality workflow; expected all validation steps pass and `git diff --exit-code` reports no uncommitted generated delta.

- [ ] **Step 6: Commit the source snapshot and generated outputs together**

Keep the builder and generated pages inseparable so a future regeneration cannot silently revert current facts.

---

### Task 3: Define a machine-readable opportunity handoff

**Files:**
- Create: `ops/traffic-opportunity.schema.json`
- Create: `ops/traffic-opportunity.example.json`
- Create: `scripts/validate-traffic-opportunity.mjs`
- Modify: `.github/workflows/quality.yml`

**Interfaces:**
- Consumes: Perception/Astra opportunity candidates.
- Produces: a validated job contract containing `id`, evidence, confidence, intent, VCF destination, asset recommendation, Claude brief, Codex task, approval requirement, campaign attribution, status, and outcome placeholders.

- [ ] **Step 1: Write the validator against a deliberately incomplete example**

Assert failure when evidence, destination, conversion goal, or approval boundary is missing.

- [ ] **Step 2: Run the validator and verify RED**

Run: `node scripts/validate-traffic-opportunity.mjs`
Expected: failure naming the missing required fields.

- [ ] **Step 3: Add the JSON schema and a complete example opportunity**

Use enumerated statuses and confidence/source fields that keep verified fact distinct from observation/theory.

- [ ] **Step 4: Run the validator and verify GREEN**

Expected: the example passes with no warnings.

- [ ] **Step 5: Add the validator to the repository quality gate**

A malformed handoff must block review just like auth/SEO regressions.

---

### Task 4: Extend the existing VCF worker into a traffic scout

**Files:**
- Operational configuration: existing `VCF Agent Checks` automation; do not create a duplicate worker.
- Document: `DAILY-OPS.md`

**Interfaces:**
- Consumes: current public site health, repository state, first-party GTA VI developments, and accessible demand signals.
- Produces: up to three ranked, source-backed traffic opportunity briefs in the Task 3 contract shape, while retaining the existing three-hour health/security/joining checks.

- [ ] **Step 1: Preserve the existing monitoring responsibilities and schedule**

Do not reduce availability, joining, repository, or security coverage.

- [ ] **Step 2: Add a bounded opportunity-scout output**

For each candidate include evidence, why-now signal, target VCF destination, recommended asset, conversion goal, and whether Claude/Codex work is warranted.

- [ ] **Step 3: Keep the worker non-publishing**

It may inspect, rank, and prepare reviewable work; no public post, production change, form submission, spend, or outreach occurs from the monitoring worker.

- [ ] **Step 4: Document the worker handoff in `DAILY-OPS.md`**

Explain how an opportunity becomes a Perception job and when it escalates for approval.

---

### Task 5: Make destination-to-discussion conversion measurable

**Files:**
- Inspect/modify as needed: `js/app.js`
- Inspect/modify as needed: discovery-page CTA generation in `scripts/build-seo-pages.mjs`
- Inspect/modify as needed: existing telemetry schema/migrations
- Modify: relevant validation scripts

**Interfaces:**
- Consumes: campaign/referrer parameters and destination page/thread context.
- Produces: attributable completed profiles, first posts/replies, and returning-member measures where the existing schema safely supports them.

- [ ] **Step 1: Define the minimum attribution events and expected persistence**

At minimum distinguish destination visit/source, completed profile, and first genuine post/reply without identifying fake or staff-seeded activity as member activation.

- [ ] **Step 2: Add failing validation for the chosen attribution hooks**

The test must reject a discovery CTA that loses the campaign/destination context needed for measurement.

- [ ] **Step 3: Implement the smallest safe attribution path**

Reuse existing telemetry structures when possible; do not create a parallel analytics system without evidence it is necessary.

- [ ] **Step 4: Run repository validation and inspect privacy/security impact**

No secret, sensitive auth token, or unnecessary user-level tracking belongs in public client code.

- [ ] **Step 5: Verify the live funnel only after production approval**

A successful build is not a successful funnel. Verify real destination → signup/profile → first discussion behavior before calling this task DONE.

---

### Task 6: Activate the three-model execution lane

**Files:**
- Perception orchestration/configuration outside VCF repo as applicable.
- Reference contract: `ops/traffic-opportunity.schema.json`.

**Interfaces:**
- Consumes: a validated Perception opportunity record.
- Produces: Claude strategy output, Codex review branch/PR output, Astra/Perception verification result, and measured post-launch outcome state.

- [ ] **Step 1: Wire Astra/Perception as the only job router**

Simple opportunities may skip Claude or Codex when their work is unnecessary; high-value opportunities may request parallel analysis, but all outputs attach to one canonical job record.

- [ ] **Step 2: Connect Claude through an authenticated supported interface**

Do not store its chat/session as the source of truth; persist only bounded task inputs/outputs needed by Perception.

- [ ] **Step 3: Connect Codex to the repository/build lane**

Default output is a branch/PR plus verification evidence, not a production deploy.

- [ ] **Step 4: Add Astra/Perception final verification**

Check source fidelity, usefulness, conversion path, CI, and whether consequential approval is required.

- [ ] **Step 5: Close the feedback loop**

Feed measured impressions/visits, completed profiles, first posts/replies, and return activity back into opportunity scoring so future work is ranked by observed value.
