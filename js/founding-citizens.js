const supabase = globalThis.__VCF_SUPABASE__;

let foundingCount = null;
let foundingRows = [];
let currentUserId = null;
let refreshTimer = null;

function esc(v=''){
  return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function rankFor(userId){
  if(!userId) return null;
  const index = foundingRows.findIndex(row=>row.id===userId);
  return index >= 0 ? index + 1 : null;
}

async function refreshCampaignData(){
  if(!supabase) return;
  try{
    const [{count,error:countError},{data,error:listError},{data:sessionData}] = await Promise.all([
      supabase.from('profiles').select('id',{count:'exact',head:true}).eq('onboarded',true),
      supabase.from('profiles').select('id,created_at').eq('onboarded',true).order('created_at',{ascending:true}).limit(100),
      supabase.auth.getSession()
    ]);
    if(!countError && Number.isFinite(count)) foundingCount = count;
    if(!listError && Array.isArray(data)) foundingRows = data;
    currentUserId = sessionData?.session?.user?.id || null;
  }catch(e){
    console.warn('Founding Citizen campaign data unavailable.', e);
  }
  decorate();
}

function campaignState(){
  const claimed = Number.isFinite(foundingCount) ? Math.min(foundingCount,100) : null;
  const full = Number.isFinite(foundingCount) && foundingCount >= 100;
  return {claimed,full,rank:rankFor(currentUserId)};
}

function decorateHome(){
  const hero = document.querySelector('#view .hero');
  if(!hero || hero.dataset.foundingDecorated==='true') return;
  hero.dataset.foundingDecorated='true';

  const {claimed,full,rank} = campaignState();
  const eyebrow = hero.querySelector('.eyebrow');
  const title = hero.querySelector('h1');
  const copy = hero.querySelector('p');
  const actions = hero.querySelector('.hero-actions');
  if(eyebrow) eyebrow.innerHTML = `FOUNDING CITIZEN CAMPAIGN <span class="founding-hero-flag">FIRST 100</span>`;
  if(title) title.textContent = 'THE GTA 6 COMMUNITY IS OPEN.';
  if(copy) copy.textContent = full
    ? 'The first 100 Founding Citizens have been claimed. Follow verified GTA 6 news, clips, guides, and discussion as Vice City approaches.'
    : 'Join the first 100 completed member profiles and help build the founding generation of this independent GTA 6 community.';

  if(actions){
    const panel = document.createElement('div');
    panel.className = 'founding-panel';
    const countText = claimed===null ? 'FIRST 100 MEMBERS' : `${claimed} / 100 CLAIMED`;
    const progress = claimed===null ? 0 : Math.max(2,Math.min(100,claimed));
    const statusCopy = rank
      ? `You are Founding Citizen #${String(rank).padStart(3,'0')}. Your early-member status is tied to your account.`
      : full
        ? 'The founding round is complete, but the city is still just getting started.'
        : 'Create an account, claim your handle, and complete your profile before the first 100 spots are gone.';
    panel.innerHTML = `<div class="founding-topline"><div><div class="founding-kicker">FOUNDING CITIZEN STATUS</div><div class="founding-count">${esc(countText)}</div></div>${rank?`<div class="founding-status-inline">YOUR #${String(rank).padStart(3,'0')}</div>`:''}</div><p class="founding-copy">${esc(statusCopy)}</p>${claimed===null?'':`<div class="founding-progress" aria-label="Founding Citizen progress"><span style="width:${progress}%"></span></div>`}<div class="founding-steps"><span class="founding-step">1 · CREATE ACCOUNT</span><span class="founding-step">2 · CLAIM HANDLE</span><span class="founding-step">3 · JOIN A DISCUSSION</span></div>`;
    actions.before(panel);

    const signup = actions.querySelector('[data-auth="signup"]');
    if(signup) signup.textContent = full ? 'JOIN THE COMMUNITY' : 'CLAIM YOUR SPOT';
    const newThread = actions.querySelector('[data-new-thread]');
    if(newThread) newThread.textContent = 'MAKE YOUR FIRST POST';
  }
}

function decorateAuth(){
  const modal = document.querySelector('#modal-root .modal');
  if(!modal || modal.dataset.foundingDecorated==='true') return;
  const signupTab = modal.querySelector('[data-switch="signup"].active');
  if(!signupTab) return;
  modal.dataset.foundingDecorated='true';
  const {full} = campaignState();
  const h2 = modal.querySelector('h2');
  const muted = modal.querySelector('p.muted');
  const tabs = modal.querySelector('.auth-tabs');
  if(h2) h2.textContent = full ? 'JOIN VICE CITY' : 'CLAIM YOUR SPOT';
  if(muted) muted.textContent = full
    ? 'Create your Vice City Forums account and join the GTA VI community.'
    : 'Complete your account and handle to qualify for one of the first 100 Founding Citizen positions.';
  if(tabs && !full){
    const note = document.createElement('div');
    note.className = 'founding-auth-note';
    note.textContent = 'FOUNDING CITIZEN · First 100 completed member profiles. No fake scarcity—the live count comes from real completed accounts.';
    tabs.after(note);
  }
  const submit = modal.querySelector('#auth-form button[type="submit"]');
  if(submit && !full) submit.textContent = 'CREATE ACCOUNT + CLAIM SPOT';
}

function decorateMemberBadge(){
  const rank = rankFor(currentUserId);
  if(!rank) return;
  const side = document.querySelector('#side-user .userline > div');
  if(!side || side.querySelector('.founding-member-badge')) return;
  const badge = document.createElement('small');
  badge.className = 'founding-member-badge';
  badge.textContent = `FOUNDING CITIZEN #${String(rank).padStart(3,'0')}`;
  side.appendChild(badge);
}

function decorateMobileCta(){
  const cta = document.querySelector('#mobile-auth-cta');
  if(!cta || document.body.classList.contains('signed-in')) return;
  const {full} = campaignState();
  cta.textContent = full ? 'CREATE ACCOUNT' : 'JOIN THE FIRST 100';
}

function decorate(){
  decorateHome();
  decorateAuth();
  decorateMemberBadge();
  decorateMobileCta();
}

if(supabase){
  await refreshCampaignData();
  supabase.auth.onAuthStateChange(()=>{
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshCampaignData,500);
  });

  window.addEventListener('hashchange',()=>{
    setTimeout(()=>{
      decorate();
      if(currentUserId && !rankFor(currentUserId)) refreshCampaignData();
    },80);
  });

  const observer = new MutationObserver(()=>decorate());
  observer.observe(document.body,{childList:true,subtree:true});
}
