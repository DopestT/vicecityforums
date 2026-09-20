import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const app = read('js/app.js');
const index = read('index.html');
const admin = read('admin.html');

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
requireText(app, "founding-citizens.js?v=20260920-1", 'founding campaign loads from the canonical app');
requireText(index, 'src="js/app.js?v=20260920-1"', 'homepage loads app.js directly');
if (index.includes('src="js/backend-bootstrap.js')) failures.push('homepage still depends on backend-bootstrap.js');
requireText(admin, "https://mzqplhhtsnahxghxpwcd.supabase.co", 'admin uses the canonical Supabase project');
requireText(admin, '@supabase/supabase-js@2.115.0', 'admin Supabase client is version-pinned');
requireText(admin, 'SEED 30 DISCUSSIONS', 'admin exposes the 30-discussion legitimate seed tool');

const seedCount = (admin.match(/\['(?:general-discussion|vice-city-world|gameplay-vehicles)'/g) || []).length;
if (seedCount < 30) failures.push(`expected at least 30 staff discussion seeds, found ${seedCount}`);

if (failures.length) {
  console.error('Auth/operations validation failed:');
  failures.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}

console.log(`Auth/operations validation passed: canonical auth wiring, admin access, recovery flow, and ${seedCount} staff discussion seeds verified.`);
