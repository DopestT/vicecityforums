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
  const label = full ? 'CREATE ACCOUNT' : 'JOIN THE FIRST 100';
  if(cta.textContent !== label) cta.textContent = label;
}

function decorate(){
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
