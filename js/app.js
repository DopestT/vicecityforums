import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://zyjapghvxmhnuvgvjeip.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-3ngWLW6Vbcm41kjdCyHPQ_SZHpc-x0';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const $ = (s) => document.querySelector(s);
const view = $('#view');
const topName = $('#top-name');
const topDesc = $('#top-desc');
const authActions = $('#auth-actions');
const sideUser = $('#side-user');
const modalRoot = $('#modal-root');
const toastRoot = $('#toast-root');
const mobileCta = $('#mobile-auth-cta');
let session = null;
let profile = null;
let categories = [];
let categoryMap = new Map();

const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const short = (v='', n=180) => String(v).length > n ? String(v).slice(0,n).trim()+'…' : String(v);
const fmt = (v) => { try { return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(v)); } catch { return ''; } };
const initials = (v='VC') => String(v).split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();

function toast(message, isError=false){
  toastRoot.innerHTML = `<div class="toast${isError?' error':''}">${esc(message)}</div>`;
  setTimeout(()=>{ toastRoot.innerHTML=''; }, 4200);
}
function setHead(name, desc){ topName.textContent = '# '+name; topDesc.textContent = desc; }
function setActive(selector, value){
  document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
  const target = document.querySelector(`[${selector}="${CSS.escape(value)}"]`); if(target) target.classList.add('active');
}
function closeMenu(){ document.body.classList.remove('menu-open'); }
function closeModal(){ modalRoot.innerHTML=''; }

async function bootstrap(){
  const recoveryLink = new URLSearchParams(location.hash.slice(1)).get('type') === 'recovery';
  const { data } = await supabase.auth.getSession();
  session = data.session;
  await loadCategories();
  await refreshProfile();
  renderAuth();
  route();
  if(recoveryLink && session) openPasswordReset();
  supabase.auth.onAuthStateChange(async (event, nextSession)=>{
    session = nextSession;
    await refreshProfile();
    renderAuth();
    if(event === 'PASSWORD_RECOVERY'){
      openPasswordReset();
      return;
    }
    if(session && profile && !profile.onboarded) openOnboarding();
  });
}

async function loadCategories(){
  const { data, error } = await supabase.from('categories').select('id,slug,name,description,accent,sort_order').order('sort_order');
  if(error){ toast('Could not load forum categories.', true); return; }
  categories = data || [];
  categoryMap = new Map(categories.map(c=>[c.id,c]));
}
async function refreshProfile(){
  profile = null;
  if(!session?.user?.id) return;
  const { data } = await supabase.from('profiles').select('id,username,display_name,bio,avatar_url,onboarded').eq('id',session.user.id).maybeSingle();
  profile = data || null;
}
function renderAuth(){
  document.body.classList.toggle('signed-in', !!session);
  document.body.classList.toggle('guest', !session);
  if(session){
    const label = profile?.display_name || profile?.username || 'Member';
    authActions.innerHTML = `<button class="btn small" data-new-thread>NEW THREAD</button><span class="username">${esc(label)}</span><button class="btn small ghost" data-signout>LOG OUT</button>`;
    sideUser.innerHTML = `<div class="userline"><span class="avatar">${esc(initials(label))}</span><div><b>${esc(label)}</b><small>${profile?.username?'@'+esc(profile.username):'Finish profile setup'}</small></div></div>`;
  } else {
    authActions.innerHTML = `<button class="btn small ghost" data-auth="login">LOG IN</button><button class="btn small desktop-create" data-auth="signup">CREATE ACCOUNT</button>`;
    sideUser.innerHTML = `<button class="btn" style="width:100%" data-auth="signup">JOIN THE CITY</button>`;
  }
  bindGlobalActions();
}
function bindGlobalActions(){
  document.querySelectorAll('[data-auth]').forEach(b=>b.onclick=()=>openAuth(b.dataset.auth));
  document.querySelectorAll('[data-signout]').forEach(b=>b.onclick=signOut);
  document.querySelectorAll('[data-new-thread]').forEach(b=>b.onclick=()=>{ location.hash='#new'; });
}

function openAuth(mode='signup'){
  const signup = mode !== 'login';
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal"><button class="modal-close" aria-label="Close">×</button><div class="eyebrow">VICE CITY FORUMS</div><h2>${signup?'CREATE ACCOUNT':'WELCOME BACK'}</h2><p class="muted">${signup?'Join the independent GTA VI fan community.':'Log in to post, reply and manage your profile.'}</p><div class="auth-tabs"><button data-switch="signup" class="${signup?'active':''}">SIGN UP</button><button data-switch="login" class="${!signup?'active':''}">LOG IN</button></div><form id="auth-form" class="form"><div class="field"><label>EMAIL</label><input name="email" type="email" autocomplete="email" required></div><div class="field"><label>PASSWORD</label><input name="password" type="password" minlength="8" autocomplete="${signup?'new-password':'current-password'}" required></div><div id="auth-message"></div><button class="btn" type="submit">${signup?'CREATE ACCOUNT':'LOG IN'}</button>${signup?'':'<button class="btn ghost" type="button" id="forgot-password">FORGOT PASSWORD?</button>'}</form></div></div>`;
  $('.modal-close').onclick=closeModal;
  $('.modal-backdrop').onclick=e=>{ if(e.target===e.currentTarget) closeModal(); };
  document.querySelectorAll('[data-switch]').forEach(b=>b.onclick=()=>openAuth(b.dataset.switch));
  if(!signup) $('#forgot-password').onclick=openForgotPassword;
  $('#auth-form').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget), email=String(fd.get('email')).trim(), password=String(fd.get('password'));
    const msg=$('#auth-message'); msg.innerHTML='<div class="notice">Connecting…</div>';
    if(signup){
      const { data, error } = await supabase.auth.signUp({email,password});
      if(error){ msg.innerHTML=`<div class="notice error">${esc(error.message)}</div>`; return; }
      if(data.session){
        session=data.session; await refreshProfile(); renderAuth(); closeModal(); openOnboarding();
      } else {
        msg.innerHTML='<div class="notice">Account created. Check your email for the confirmation link, then return here and log in.</div>';
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({email,password});
      if(error){ msg.innerHTML=`<div class="notice error">${esc(error.message)}</div>`; return; }
      session=data.session; await refreshProfile(); renderAuth(); closeModal();
      if(!profile?.onboarded) openOnboarding(); else { toast('Logged in.'); route(); }
    }
  };
}

function openForgotPassword(){
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal"><button class="modal-close" aria-label="Close">×</button><div class="eyebrow">VICE CITY FORUMS</div><h2>RESET PASSWORD</h2><p class="muted">Enter your account email. We will send you a secure link to choose a new password.</p><form id="forgot-form" class="form"><div class="field"><label>EMAIL</label><input name="email" type="email" autocomplete="email" required></div><div id="forgot-message"></div><button class="btn" type="submit">SEND RESET LINK</button><button class="btn ghost" type="button" id="back-to-login">BACK TO LOG IN</button></form></div></div>`;
  $('.modal-close').onclick=closeModal;
  $('.modal-backdrop').onclick=e=>{ if(e.target===e.currentTarget) closeModal(); };
  $('#back-to-login').onclick=()=>openAuth('login');
  $('#forgot-form').onsubmit = async e => {
    e.preventDefault();
    const email=String(new FormData(e.currentTarget).get('email')).trim();
    const msg=$('#forgot-message');
    msg.innerHTML='<div class="notice">Sending reset link…</div>';
    const { error } = await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}/`});
    if(error){ msg.innerHTML=`<div class="notice error">${esc(error.message)}</div>`; return; }
    msg.innerHTML='<div class="notice">If an account exists for that email, a reset link is on the way. Open it to choose your new password.</div>';
  };
}

function openPasswordReset(){
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal"><div class="eyebrow">VICE CITY FORUMS</div><h2>CHOOSE A NEW PASSWORD</h2><p class="muted">Your reset link is verified. Enter a new password for this account.</p><form id="password-reset-form" class="form"><div class="field"><label>NEW PASSWORD</label><input name="password" type="password" minlength="8" autocomplete="new-password" required></div><div class="field"><label>CONFIRM PASSWORD</label><input name="confirm_password" type="password" minlength="8" autocomplete="new-password" required></div><div id="password-reset-message"></div><button class="btn" type="submit">SAVE NEW PASSWORD</button></form></div></div>`;
  $('#password-reset-form').onsubmit = async e => {
    e.preventDefault();
    const fd=new FormData(e.currentTarget), password=String(fd.get('password')), confirmPassword=String(fd.get('confirm_password'));
    const msg=$('#password-reset-message');
    if(password !== confirmPassword){ msg.innerHTML='<div class="notice error">Passwords do not match.</div>'; return; }
    msg.innerHTML='<div class="notice">Saving new password…</div>';
    const { error } = await supabase.auth.updateUser({password});
    if(error){ msg.innerHTML=`<div class="notice error">${esc(error.message)}</div>`; return; }
    closeModal();
    toast('Password updated. You are logged in.');
    if(!profile?.onboarded) openOnboarding(); else route();
  };
}

function openOnboarding(){
  if(!session) return openAuth('signup');
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal"><div class="eyebrow">ONE LAST STEP</div><h2>CLAIM YOUR HANDLE</h2><p class="muted">Choose how you appear across Vice City Forums.</p><form id="onboard-form" class="form"><div class="field"><label>USERNAME</label><input name="username" minlength="3" maxlength="24" pattern="[A-Za-z0-9_]+" placeholder="vicecitizen" required></div><div class="field"><label>DISPLAY NAME</label><input name="display_name" minlength="2" maxlength="40" placeholder="Vice Citizen" required></div><div class="field"><label>BIO <span class="muted">(optional)</span></label><textarea name="bio" maxlength="400" style="min-height:90px"></textarea></div><div id="onboard-message"></div><button class="btn" type="submit">ENTER THE CITY</button></form></div></div>`;
  $('#onboard-form').onsubmit = async e => {
    e.preventDefault(); const fd=new FormData(e.currentTarget);
    const username=String(fd.get('username')).trim().toLowerCase(), display_name=String(fd.get('display_name')).trim(), bio=String(fd.get('bio')||'').trim();
    const msg=$('#onboard-message');
    const { error } = await supabase.from('profiles').update({username,display_name,bio,onboarded:true}).eq('id',session.user.id);
    if(error){ msg.innerHTML=`<div class="notice error">${esc(error.code==='23505'?'That username is already taken.':error.message)}</div>`; return; }
    await refreshProfile(); renderAuth(); closeModal(); toast('Profile ready. Welcome to Vice City Forums.'); location.hash='#categories';
  };
}

async function signOut(){ await supabase.auth.signOut(); session=null; profile=null; renderAuth(); toast('Logged out.'); location.hash='#home'; }

async function getThreads(categoryId=null, limit=30){
  let q=supabase.from('threads').select('id,category_id,author_id,title,body,is_pinned,is_locked,is_demo,demo_author_label,reply_count,last_activity_at,created_at').order('is_pinned',{ascending:false}).order('last_activity_at',{ascending:false}).limit(limit);
  if(categoryId) q=q.eq('category_id',categoryId);
  const {data,error}=await q; if(error) throw error;
  const rows=data||[]; const ids=[...new Set(rows.map(r=>r.author_id).filter(Boolean))]; const authors={};
  if(ids.length){ const {data:ps}=await supabase.from('profiles').select('id,username,display_name').in('id',ids); (ps||[]).forEach(p=>authors[p.id]=p); }
  return {rows,authors};
}
function authorLabel(row,authors){ if(row.is_demo) return row.demo_author_label||'DEMO POST'; const a=authors[row.author_id]; return a?.display_name||a?.username||'Member'; }
function threadCard(row,authors){
  const cat=categoryMap.get(row.category_id); return `<article class="thread-card" data-thread="${esc(row.id)}"><div>${row.is_demo?'<span class="demo">DEMO</span> ':''}${row.is_pinned?'<span class="pinned">PINNED</span>':''}</div><h3 class="thread-title">${esc(row.title)}</h3><p>${esc(short(row.body,220))}</p><div class="thread-meta"><span>${esc(cat?.name||'Forum')}</span><span>by ${esc(authorLabel(row,authors))}</span><span>${row.reply_count||0} replies</span><span>${esc(fmt(row.last_activity_at))}</span></div></article>`;
}

async function home(){
  setHead('vice-wire','The city starts here.'); setActive('data-route','home');
  view.innerHTML='<div class="loading">Loading the city…</div>';
  try{
    const {rows,authors}=await getThreads(null,8);
    view.innerHTML=`<div class="content"><section class="hero"><div class="eyebrow">GTA VI FAN COMMUNITY</div><h1>VICE CITY IS BIGGER WITH PEOPLE.</h1><p>News. Trailer breakdowns. World discoveries. Gameplay. Crews. Clips. One independent community built for the GTA VI era.</p><div class="hero-actions">${session?'<button class="btn" data-new-thread>START A THREAD</button>':'<button class="btn" data-auth="signup">CREATE YOUR ACCOUNT</button><button class="btn ghost" data-auth="login">LOG IN</button>'}<button class="btn ghost" data-go-categories>BROWSE FORUMS</button></div><div class="launch-note">Unofficial fan community · Not affiliated with Rockstar Games or Take-Two Interactive</div></section><div class="section-head"><h2 class="section-title">LATEST DISCUSSIONS</h2><button class="btn small ghost" data-go-categories>ALL FORUMS</button></div><div class="thread-list">${rows.length?rows.map(r=>threadCard(r,authors)).join(''):'<div class="empty">No discussions yet. Be the first to post.</div>'}</div></div>`;
    bindPageActions();
  }catch(e){ showError(e); }
}

async function allCategories(){
  setHead('all-forums','Pick a district and join the discussion.'); setActive('data-route','categories');
  view.innerHTML=`<div class="content"><div class="eyebrow">CITY DIRECTORY</div><h1 class="page-title">ALL FORUMS</h1><p class="page-sub">Browse every launch board. Anyone can read; members can post and reply.</p><div class="grid">${categories.map(c=>`<article class="category-card" data-category="${esc(c.slug)}"><div class="accent"></div><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p><span class="meta">ENTER FORUM →</span></article>`).join('')}</div></div>`; bindPageActions();
}

async function categoryPage(slug){
  const cat=categories.find(c=>c.slug===slug); if(!cat) return allCategories();
  setHead(cat.slug,cat.description); setActive('data-category',slug); view.innerHTML='<div class="loading">Loading discussions…</div>';
  try{
    const {rows,authors}=await getThreads(cat.id,50);
    view.innerHTML=`<div class="content"><div class="eyebrow">FORUM</div><h1 class="page-title">${esc(cat.name)}</h1><p class="page-sub">${esc(cat.description)}</p><div class="section-head"><span class="muted">${rows.length} discussion${rows.length===1?'':'s'}</span>${session?'<button class="btn small" data-new-thread>NEW THREAD</button>':'<button class="btn small" data-auth="signup">JOIN TO POST</button>'}</div><div class="thread-list">${rows.length?rows.map(r=>threadCard(r,authors)).join(''):'<div class="empty">No threads here yet. Start the first one.</div>'}</div></div>`; bindPageActions();
  }catch(e){ showError(e); }
}

async function threadPage(id){
  setHead('discussion','Community thread'); view.innerHTML='<div class="loading">Loading thread…</div>';
  const {data:thread,error}=await supabase.from('threads').select('id,category_id,author_id,title,body,is_pinned,is_locked,is_demo,demo_author_label,reply_count,created_at').eq('id',id).maybeSingle();
  if(error||!thread){ view.innerHTML='<div class="content"><div class="empty">Thread not found.</div></div>'; return; }
  const {data:replies}=await supabase.from('replies').select('id,author_id,body,is_demo,demo_author_label,created_at').eq('thread_id',id).order('created_at');
  const ids=[thread.author_id,...(replies||[]).map(r=>r.author_id)].filter(Boolean); const authors={};
  if(ids.length){ const {data:ps}=await supabase.from('profiles').select('id,username,display_name').in('id',[...new Set(ids)]); (ps||[]).forEach(p=>authors[p.id]=p); }
  const cat=categoryMap.get(thread.category_id); setHead(cat?.slug||'discussion',cat?.name||'Community discussion');
  const replyHtml=(replies||[]).map(r=>`<article class="reply-card"><div class="reply-head"><b>${esc(authorLabel(r,authors))}${r.is_demo?' <span class="demo">DEMO</span>':''}</b><span>${esc(fmt(r.created_at))}</span></div><p class="thread-body">${esc(r.body)}</p></article>`).join('');
  view.innerHTML=`<div class="content"><div class="eyebrow">${esc(cat?.name||'FORUM')}</div><h1 class="page-title">${esc(thread.title)}</h1><div class="thread-meta"><span>by ${esc(authorLabel(thread,authors))}</span><span>${esc(fmt(thread.created_at))}</span>${thread.is_demo?'<span class="demo">DEMO CONTENT</span>':''}</div><article class="panel" style="margin-top:16px"><div class="thread-body">${esc(thread.body)}</div></article><div class="section-head"><h2 class="section-title">REPLIES</h2><span class="muted">${(replies||[]).length}</span></div>${replyHtml||'<div class="empty">No replies yet.</div>'}${thread.is_locked?'<div class="notice" style="margin-top:14px">This thread is locked.</div>':session?`<article class="panel" style="margin-top:14px"><form id="reply-form" class="form"><div class="field"><label>ADD A REPLY</label><textarea name="body" maxlength="10000" required></textarea></div><button class="btn" type="submit">POST REPLY</button></form></article>`:'<div class="panel" style="margin-top:14px"><b>Want to reply?</b><p>Create an account to join the discussion.</p><button class="btn" data-auth="signup">CREATE ACCOUNT</button></div>'}</div>`;
  if($('#reply-form')) $('#reply-form').onsubmit=async e=>{e.preventDefault(); if(!ensureOnboarded()) return; const body=String(new FormData(e.currentTarget).get('body')).trim(); if(!body) return; const {error}=await supabase.from('replies').insert({thread_id:id,author_id:session.user.id,body}); if(error) return toast(error.message,true); toast('Reply posted.'); threadPage(id);};
  bindPageActions();
}

function ensureOnboarded(){ if(!session){openAuth('signup');return false;} if(!profile?.onboarded){openOnboarding();return false;} return true; }
function newThreadPage(){
  setHead('new-thread','Start a real community discussion.');
  if(!ensureOnboarded()){ location.hash='#categories'; return; }
  view.innerHTML=`<div class="content"><div class="eyebrow">CREATE</div><h1 class="page-title">NEW THREAD</h1><p class="page-sub">Choose the right forum and start the conversation.</p><article class="panel"><form id="thread-form" class="form"><div class="field"><label>FORUM</label><select name="category_id" required>${categories.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></div><div class="field"><label>TITLE</label><input name="title" minlength="4" maxlength="140" required></div><div class="field"><label>POST</label><textarea name="body" maxlength="20000" required></textarea></div><button class="btn" type="submit">PUBLISH THREAD</button></form></article></div>`;
  $('#thread-form').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const row={category_id:String(fd.get('category_id')),author_id:session.user.id,title:String(fd.get('title')).trim(),body:String(fd.get('body')).trim()};const {data,error}=await supabase.from('threads').insert(row).select('id').single();if(error)return toast(error.message,true);toast('Thread published.');location.hash='#thread/'+data.id;};
}

function comingSoon(kind){ const crews=kind==='crews'; setHead(kind,crews?'Find your people. Build your crew.':'Community clips and compilations.'); setActive('data-route',kind); view.innerHTML=`<div class="content"><div class="eyebrow">COMING NEXT</div><h1 class="page-title">${crews?'CREWS & ROLEPLAY':'CLIPS & COMPILATIONS'}</h1><article class="panel"><p>${crews?'Crew discovery and recruitment are being connected to the forum accounts. The discussion board is already open now.':'Direct media uploads are next. For launch, use the Clips & Compilations forum to post links and discuss videos.'}</p><button class="btn" data-category="${crews?'crews-roleplay':'clips-compilations'}">OPEN THE FORUM</button></article></div>`; bindPageActions(); }
function legal(kind){ setHead(kind,kind==='privacy'?'Privacy information':'Community terms'); const terms=kind==='terms'; view.innerHTML=`<div class="content legal"><div class="eyebrow">VICE CITY FORUMS</div><h1 class="page-title">${terms?'TERMS':'PRIVACY'}</h1><h2>${terms?'Community Use':'Account Data'}</h2><p>${terms?'Vice City Forums is an independent fan community. Users are responsible for what they post. Harassment, illegal content, impersonation, spam, and attempts to compromise the service may be removed or restricted.':'Account authentication is handled through Supabase. Public profile fields may include username, display name, bio and avatar. Email addresses are used for authentication and are not displayed publicly by the forum.'}</p><h2>Fan Community Notice</h2><p>Vice City Forums is not affiliated with, endorsed by, sponsored by, or associated with Rockstar Games or Take-Two Interactive. Grand Theft Auto and related marks belong to their respective owners.</p></div>`; }

function bindPageActions(){
  document.querySelectorAll('[data-thread]').forEach(x=>x.onclick=()=>location.hash='#thread/'+x.dataset.thread);
  document.querySelectorAll('[data-category]').forEach(x=>x.onclick=()=>location.hash='#category/'+x.dataset.category);
  document.querySelectorAll('[data-go-categories]').forEach(x=>x.onclick=()=>location.hash='#categories');
  bindGlobalActions();
}
function showError(e){ console.error(e); view.innerHTML=`<div class="content"><div class="notice error">The forum could not load this view. Refresh and try again.</div></div>`; }
function route(){
  closeMenu(); const raw=location.hash.replace(/^#/,'')||'home'; const [page,arg]=raw.split('/');
  if(page==='home') return home(); if(page==='categories') return allCategories(); if(page==='category') return categoryPage(arg); if(page==='thread') return threadPage(arg); if(page==='new') return newThreadPage(); if(page==='clips'||page==='crews') return comingSoon(page); if(page==='privacy'||page==='terms') return legal(page); return home();
}

$('#mobile-menu').onclick=()=>document.body.classList.toggle('menu-open');
mobileCta.onclick=()=>openAuth('signup');
document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{location.hash='#'+b.dataset.route;});
document.querySelectorAll('.sidebar [data-category]').forEach(b=>b.onclick=()=>{location.hash='#category/'+b.dataset.category;});
window.addEventListener('hashchange',route);
bootstrap().catch(showError);
