import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const read = path => readFile(resolve(root, path), 'utf8');
const [app, clips, admin, styles, migration, hardening, publicPolicy, guide] = await Promise.all([
  read('js/app.js'),
  read('js/clips.js'),
  read('admin.html'),
  read('css/styles.css'),
  read('supabase/clips_foundation.sql'),
  read('supabase/clips_foundation_hardening.sql'),
  read('supabase/clips_public_read_policy.sql'),
  read('gta-6-funny-clips/index.html'),
]);

const failures = [];
const requireText = (source, needle, label) => {
  if (!source.includes(needle)) failures.push(label);
};

requireText(app, "import { createClipsModule }", 'app imports the clips module');
requireText(app, "clipsModule.show(arg)", 'clips hash route opens the native feed');
requireText(clips, ".eq('status', 'published')", 'public feed only requests published clips');
requireText(clips, "from('clip_engagements')", 'member engagement is persisted');
requireText(clips, "from('clip_reports')", 'private reports are persisted');
requireText(clips, "rights_attested", 'submission includes rights attestation');
requireText(clips, "source_type", 'submission includes provenance labels');
requireText(admin, "supabase.rpc('publish_clip'", 'admin publication uses the atomic database RPC');
requireText(admin, '@supabase/supabase-js@2.115.0', 'admin Supabase client is version-pinned');
requireText(styles, '.clips-feed', 'clips feed styles exist');
requireText(styles, 'scroll-snap-type:y mandatory', 'clips feed keeps one-card snap navigation');
requireText(guide, 'href="/#clips"', 'search hub links to the native clips feed');

for (const table of ['clips', 'clip_engagements', 'clip_reports']) {
  requireText(migration, `alter table public.${table} enable row level security`, `${table} has RLS enabled`);
}
for (const label of ['official-rockstar', 'user-gameplay', 'fan-made', 'ai-generated']) {
  requireText(migration, `'${label}'`, `migration supports the ${label} source label`);
}
requireText(migration, "current_date < date '2026-11-19'", 'pre-launch gameplay submissions are blocked in the database');
requireText(migration, 'security definer', 'privileged counter helpers declare their security mode');
requireText(migration, 'revoke all on schema private from public, anon, authenticated', 'private helper schema is inaccessible to API roles');
requireText(migration, 'revoke all on function public.protect_clip_system_fields()', 'trigger helper is not directly callable');
requireText(migration, "Watch: https://vicecityforums.com/#clips/", 'generated discussions link to the real feed route');
requireText(hardening, 'alter function public.publish_clip(uuid) security invoker', 'publication RPC is RLS-aware');
requireText(hardening, '(select public.is_forum_admin())', 'admins may create attributed clip discussions');
requireText(hardening, 'clip_reports_reporter_id_idx', 'reporter foreign key has a covering index');
requireText(publicPolicy, 'for select to anon', 'guests have an isolated public read policy');
requireText(publicPolicy, "using (status = 'published')", 'guests can only read published clips');
requireText(publicPolicy, 'for select to authenticated', 'members have a separate read policy');

const seededOfficialClips = (migration.match(/'official-rockstar', 'https:\/\/www\.rockstargames\.com\/VI\/media\/videos'/g) || []).length;
if (seededOfficialClips !== 9) failures.push(`expected 9 official Rockstar seed clips, found ${seededOfficialClips}`);

if (/@supabase\/supabase-js@2(?:['"?])/g.test(admin)) failures.push('admin contains an unpinned Supabase import');

if (failures.length) {
  console.error('Clips validation failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Clips validation passed: feed, provenance, moderation, RLS, and forum linkage are wired.');
