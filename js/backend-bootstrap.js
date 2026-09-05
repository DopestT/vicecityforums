const OLD_SUPABASE_URL = 'https://zyjapghvxmhnuvgvjeip.supabase.co';
const NEW_SUPABASE_URL = 'https://mzqplhhtsnahxghxpwcd.supabase.co';
const OLD_SUPABASE_KEY = 'sb_publishable_-3ngWLW6Vbcm41kjdCyHPQ_SZHpc-x0';
const NEW_SUPABASE_KEY = 'sb_publishable_iOZHjbnIztfwjLQ82WCmCw_-FyEQ51q';

const nativeFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = (input, init = {}) => {
  let url = typeof input === 'string' ? input : input?.url;
  if (!url || !url.startsWith(OLD_SUPABASE_URL)) {
    return nativeFetch(input, init);
  }

  url = NEW_SUPABASE_URL + url.slice(OLD_SUPABASE_URL.length);

  const headers = new Headers(init.headers || (typeof input !== 'string' ? input?.headers : undefined) || {});
  if (headers.get('apikey') === OLD_SUPABASE_KEY) headers.set('apikey', NEW_SUPABASE_KEY);
  if (headers.get('authorization') === `Bearer ${OLD_SUPABASE_KEY}`) {
    headers.set('authorization', `Bearer ${NEW_SUPABASE_KEY}`);
  }

  const nextInit = { ...init, headers };
  if (typeof input === 'string') return nativeFetch(url, nextInit);

  const nextRequest = new Request(url, input);
  return nativeFetch(nextRequest, nextInit);
};

import('./app.js');
