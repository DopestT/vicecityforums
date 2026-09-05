const OLD_SUPABASE_URL = 'https://zyjapghvxmhnuvgvjeip.supabase.co';
const NEW_SUPABASE_URL = 'https://mzqplhhtsnahxghxpwcd.supabase.co';
const OLD_SUPABASE_KEY = 'sb_publishable_-3ngWLW6Vbcm41kjdCyHPQ_SZHpc-x0';
const NEW_SUPABASE_KEY = 'sb_publishable_iOZHjbnIztfwjLQ82WCmCw_-FyEQ51q';
const FORUM_URL = 'https://dopestt.github.io/vicecityforums/';

const appUrl = new URL('./app.js', import.meta.url);
const response = await fetch(appUrl, { cache: 'no-store' });
if (!response.ok) throw new Error(`Failed to load app.js: ${response.status}`);

let source = await response.text();
source = source
  .replaceAll(OLD_SUPABASE_URL, NEW_SUPABASE_URL)
  .replaceAll(OLD_SUPABASE_KEY, NEW_SUPABASE_KEY)
  .replace(
    'supabase.auth.signUp({email,password})',
    `supabase.auth.signUp({email,password,options:{emailRedirectTo:'${FORUM_URL}'}})`
  )
  .replace(
    "redirectTo:`${location.origin}/`",
    `redirectTo:'${FORUM_URL}'`
  )
  .replace(
    "select('id,username,display_name,bio,avatar_url,onboarded')",
    "select('id,username,display_name,bio,avatar_url,onboarded,is_admin')"
  )
  .replace(
    "document.body.classList.toggle('guest', !session);",
    "document.body.classList.toggle('guest', !session); document.body.classList.toggle('admin', !!profile?.is_admin);"
  )
  .replace(
    'authActions.innerHTML = `<button class="btn small" data-new-thread>NEW THREAD</button><span class="username">${esc(label)}</span><button class="btn small ghost" data-signout>LOG OUT</button>`;',
    'authActions.innerHTML = `<button class="btn small" data-new-thread>NEW THREAD</button>${profile?.is_admin?\'<span class="pinned">ADMIN</span>\':\'\'}<span class="username">${esc(label)}</span><button class="btn small ghost" data-signout>LOG OUT</button>`;'
  )
  .replace(
    'sideUser.innerHTML = `<div class="userline"><span class="avatar">${esc(initials(label))}</span><div><b>${esc(label)}</b><small>${profile?.username?\'@\'+esc(profile.username):\'Finish profile setup\'}</small></div></div>`;',
    'sideUser.innerHTML = `<div class="userline"><span class="avatar">${esc(initials(label))}</span><div><b>${esc(label)}${profile?.is_admin?\' · ADMIN\':\'\'}</b><small>${profile?.username?\'@\'+esc(profile.username):\'Finish profile setup\'}</small></div></div>`;'
  );

const blobUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
try {
  await import(blobUrl);
} finally {
  URL.revokeObjectURL(blobUrl);
}
