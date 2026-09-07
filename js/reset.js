import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.115.0';

const SUPABASE_URL = 'https://mzqplhhtsnahxghxpwcd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iOZHjbnIztfwjLQ82WCmCw_-FyEQ51q';

const status = document.querySelector('#status');
const form = document.querySelector('#reset-form');
const message = document.querySelector('#form-message');
const success = document.querySelector('#success');
const submit = document.querySelector('#submit-password');

const setStatus = (text, error = false) => {
  status.textContent = text;
  status.classList.toggle('error', error);
};

const params = new URLSearchParams(location.hash.slice(1));
const tokenHash = params.get('token_hash');
const recoveryType = params.get('type');

// Remove the one-time token from browser history before any account UI appears.
history.replaceState(null, '', location.pathname);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

async function verifyRecovery() {
  if (!tokenHash || recoveryType !== 'recovery') {
    setStatus('This recovery link is incomplete or has already been used. Request a new link and try again.', true);
    return;
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'recovery',
  });

  if (error) {
    setStatus('This recovery link is invalid or expired. Request a new link and try again.', true);
    return;
  }

  setStatus('Link verified. Choose a new password below.');
  form.hidden = false;
  document.querySelector('#password').focus();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const password = String(data.get('password') || '');
  const confirmation = String(data.get('confirmation') || '');

  message.textContent = '';
  message.classList.remove('error');

  if (password.length < 8) {
    message.textContent = 'Use at least 8 characters.';
    message.classList.add('error');
    return;
  }

  if (password !== confirmation) {
    message.textContent = 'The passwords do not match.';
    message.classList.add('error');
    return;
  }

  submit.disabled = true;
  submit.textContent = 'SAVING…';

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    message.textContent = 'The password could not be updated. Please request a new recovery link.';
    message.classList.add('error');
    submit.disabled = false;
    submit.textContent = 'SAVE NEW PASSWORD';
    return;
  }

  form.hidden = true;
  status.hidden = true;
  success.hidden = false;
});

verifyRecovery().catch(() => {
  setStatus('The secure recovery page could not connect. Refresh once or request a new link.', true);
});
