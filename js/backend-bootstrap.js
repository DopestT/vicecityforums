// Capture recovery intent before Supabase initializes and removes auth data
// from the URL fragment.
globalThis.__VCF_RECOVERY_INTENT__ =
  new URLSearchParams(location.hash.slice(1)).get('type') === 'recovery';

await import('./app.js?v=20260909-1');

// Reuse the app's auth client so recovery handling and admin status share
// one session lifecycle and one storage lock.
const adminClient = globalThis.__VCF_SUPABASE__;
if (!adminClient) throw new Error('Shared Supabase client was not initialized.');

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
