import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const app = read('js/app.js');
const index = read('index.html');
const admin = read('admin.html');
const founding = read('js/founding-citizens.js');

const failures = [];
const requireText = (source, needle, label) => {
  if (!source.includes(needle)) failures.push(label);
};

requireText(app, "https://mzqplhhtsnahxghxpwcd.supabase.co", 'app uses the canonical Supabase project');
requireText(app, "const RECOVERY_INTENT =", 'app captures password-recovery intent before auth initialization');
requireText(app, "resetPasswordForEmail", 'forgot-password flow exists');
requireText(app, "updateUser({password})", 'password-reset completion exists');
requireText(app, "is_admin", 'profile load includes administrator state');
requireText(app, 'href="admin.html"', 'signed-in administrators receive an admin link');
requireText(app, "founding-citizens.js?v=20261119-1", 'founding campaign loads from the canonical app');
requireText(index, 'src="js/app.js?v=20261119-1"', 'homepage loads app.js directly');
if (index.includes('src="js/backend-bootstrap.js')) failures.push('homepage still depends on backend-bootstrap.js');
requireText(admin, "https://mzqplhhtsnahxghxpwcd.supabase.co", 'admin uses the canonical Supabase project');
requireText(admin, '@supabase/supabase-js@2.115.0', 'admin Supabase client is version-pinned');
requireText(admin, 'SEED 30 DISCUSSIONS', 'admin exposes the 30-discussion legitimate seed tool');
if (founding.includes('function decorateHome()') || founding.includes('founding-count')) failures.push('public founding member count must remain hidden');
requireText(app, 'TODAY ON THE WIRE', 'homepage exposes the curated VCF editorial desk');
requireText(app, 'These are featured topics, not member posts or activity counts.', 'featured content is disclosed as curated rather than member engagement');
requireText(app, 'LATEST MEMBER DISCUSSIONS', 'real discussion list is clearly separated from editorial features');
requireText(founding, "const label = full ? 'CREATE ACCOUNT' : 'JOIN THE FIRST 100';", 'mobile auth CTA computes one stable label');
requireText(founding, 'if(cta.textContent !== label) cta.textContent = label;', 'mobile auth CTA avoids rewriting unchanged text and retriggering the MutationObserver');

const seedCount = (admin.match(/\['(?:general-discussion|vice-city-world|gameplay-vehicles)'/g) || []).length;
if (seedCount < 30) failures.push(`expected at least 30 staff discussion seeds, found ${seedCount}`);

if (failures.length) {
  console.error('Auth/operations validation failed:');
  failures.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}

console.log(`Auth/operations validation passed: canonical auth wiring, admin access, recovery flow, stable founding CTA observer behavior, and ${seedCount} staff discussion seeds verified.`);
