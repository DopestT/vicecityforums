const ORIGIN = (process.env.VCF_ORIGIN || 'https://vicecityforums.com').replace(/\/$/, '');
const SUPABASE_URL = 'https://mzqplhhtsnahxghxpwcd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iOZHjbnIztfwjLQ82WCmCw_-FyEQ51q';

const failures = [];
const checks = [
  ['/', 'VICE CITY'],
  ['/gta-6-news', 'GTA 6'],
  ['/gta-6-countdown', 'GTA 6'],
  ['/robots.txt', 'Sitemap:'],
  ['/sitemap.xml', '<urlset'],
  ['/feed.xml', '<rss']
];

async function get(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, {...options, signal: controller.signal, headers: {'user-agent':'VCF-Production-Health/1.0', ...(options.headers||{})}});
  } finally {
    clearTimeout(timer);
  }
}

for (const [path, marker] of checks) {
  try {
    const response = await get(ORIGIN + path);
    const body = await response.text();
    if (!response.ok) failures.push(`${path}: HTTP ${response.status}`);
    else if (!body.includes(marker)) failures.push(`${path}: expected marker not found`);
    else console.log(`PASS ${path} · ${response.status}`);
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
  }
}

for (const host of ['https://www.vicecityforums.com/','https://vicecityforums.net/','https://www.vicecityforums.net/']) {
  try {
    const response = await get(host, {redirect:'manual'});
    const location = response.headers.get('location') || '';
    if (![301,302,307,308].includes(response.status) || !location.startsWith('https://vicecityforums.com')) {
      failures.push(`${host}: expected permanent/canonical redirect, got ${response.status} -> ${location}`);
    } else {
      console.log(`PASS redirect ${host} -> ${location}`);
    }
  } catch (error) {
    failures.push(`${host}: ${error.message}`);
  }
}

try {
  const response = await get(`${SUPABASE_URL}/rest/v1/categories?select=id&limit=1`, {
    headers: {apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`}
  });
  if (!response.ok) failures.push(`Supabase categories read: HTTP ${response.status}`);
  else console.log('PASS Supabase public categories read');
} catch (error) {
  failures.push(`Supabase categories read: ${error.message}`);
}

if (failures.length) {
  console.error('\nProduction health failed:');
  failures.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}
console.log('\nVice City Forums production health passed.');
