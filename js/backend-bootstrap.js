import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
  );

const blobUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
try {
  await import(blobUrl);
} finally {
  URL.revokeObjectURL(blobUrl);
}

// Independent admin-status layer so admin access is visible even if the
// main app re-renders its header or a browser has stale UI state.
const adminClient = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

async function getAdminState() {
  const { data: sessionData } = await adminClient.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) return null;
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id,username,display_name,is_admin')
    .eq('id', user.id)
    .maybeSingle();
  return profile?.is_admin ? profile : null;
}

function installAdminUi(profile) {
  document.body.classList.add('admin');
  const actions = document.querySelector('#auth-actions');
  if (actions && !actions.querySelector('[data-admin-status]')) {
    const button = document.createElement('button');
    button.className = 'btn small';
    button.setAttribute('data-admin-status', 'true');
    button.textContent = 'ADMIN';
    button.addEventListener('click', () => {
      location.href = new URL('admin.html', location.href).href;
    });
    actions.prepend(button);
  }
  const side = document.querySelector('#side-user b');
  if (side && !side.textContent.includes('ADMIN')) side.textContent += ' · ADMIN';
}

const adminProfile = await getAdminState();
if (adminProfile) {
  installAdminUi(adminProfile);
  const observer = new MutationObserver(() => installAdminUi(adminProfile));
  observer.observe(document.body, { childList: true, subtree: true });
}
