const STORAGE_KEY = 'vice-city-forums-state-v2';

const seed = {
  activeView: 'home',
  activeDistrict: 'All Districts',
  saved: [2],
  joinedCrews: [1],
  attendingEvents: [1],
  notificationsRead: false,
  districts: [
    { name: 'All Districts', count: 647 },
    { name: 'Ocean Beach', count: 184 },
    { name: 'Vice Point', count: 142 },
    { name: 'Little Haiti', count: 96 },
    { name: 'Downtown', count: 113 },
    { name: 'Starfish Island', count: 58 },
    { name: 'Port Gellhorn', count: 54 }
  ],
  threads: [
    { id: 1, title: 'The details everyone missed in the latest Vice City footage', body: 'A frame-by-frame community breakdown covering the marina, transit signs, social media UI, weather systems, and the map connections hiding in plain sight.', district: 'Citywide', author: 'MayaVice', role: 'Map Archivist', replies: 328, votes: 1840, age: '18 min', tier: 'legendary', featured: true, spoiler: false },
    { id: 2, title: 'Building the complete Vice City neighborhood guide before launch', body: 'Drop confirmed landmarks, businesses, highways, beaches, and district clues here. Every claim should include a source or screenshot.', district: 'Ocean Beach', author: 'Brother Big', role: 'City Founder', replies: 146, votes: 927, age: '42 min', tier: 'rare', featured: false, spoiler: false },
    { id: 3, title: 'What crew are you forming on day one?', body: 'Racing, roleplay, photography, chaos, businesses, or exploration—what kind of people are you trying to find?', district: 'Downtown', author: 'SouthBeachSai', role: 'Crew Leader', replies: 211, votes: 621, age: '1 hr', tier: 'uncommon', featured: false, spoiler: false },
    { id: 4, title: 'Dynamic weather could completely change online events', body: 'Imagine a citywide race getting hit by a tropical storm halfway through. Here is how live weather could become a real gameplay system.', district: 'Vice Point', author: 'StormWatch', role: 'Systems Analyst', replies: 84, votes: 488, age: '2 hr', tier: 'rare', featured: false, spoiler: false },
    { id: 5, title: 'The official community launch-night survival plan', body: 'Server queues, spoiler controls, launch squads, stream rooms, clip submissions, and a 24-hour rotating moderator schedule.', district: 'Citywide', author: 'Brother Big', role: 'City Founder', replies: 72, votes: 404, age: '3 hr', tier: 'legendary', featured: false, spoiler: false }
  ],
  crews: [
    { id: 1, name: 'First Wave', description: 'Founders, builders, archivists, and early citizens shaping the community before launch.', members: 212, district: 'Citywide', type: 'Community' },
    { id: 2, name: 'Neon Runners', description: 'Street racing, vehicle builds, route discovery, and competitive city events.', members: 184, district: 'Downtown', type: 'Racing' },
    { id: 3, name: 'Vice Lens', description: 'Virtual photographers, cinematic creators, editors, and visual storytellers.', members: 139, district: 'Ocean Beach', type: 'Creators' },
    { id: 4, name: 'Gellhorn Watch', description: 'Map hunters and investigators documenting everything beyond the city limits.', members: 96, district: 'Port Gellhorn', type: 'Exploration' }
  ],
  events: [
    { id: 1, title: 'Vice Night: Trailer Breakdown', date: 'Friday · 9:00 PM ET', description: 'Community watch party, live theories, creator rooms, and a complete evidence board.', going: 1240, host: 'Vice City Forums' },
    { id: 2, title: 'Founding Crews Draft', date: 'Saturday · 7:00 PM ET', description: 'Meet crew leaders, choose your lane, and claim a founding-member badge.', going: 486, host: 'First Wave' },
    { id: 3, title: 'Map Room: Coastline Investigation', date: 'Sunday · 5:00 PM ET', description: 'A collaborative map session focused on bridges, islands, highways, and Port Gellhorn.', going: 712, host: 'Gellhorn Watch' },
    { id: 4, title: 'Creator Clip Challenge', date: 'Tuesday · 8:30 PM ET', description: 'Editors and creators compete to produce the hardest 30-second Vice City concept.', going: 319, host: 'Vice Lens' }
  ],
  notifications: [
    { id: 1, type: 'reply', text: 'MayaVice replied to your neighborhood guide thread.', age: '8 min', unread: true },
    { id: 2, type: 'crew', text: 'First Wave passed 200 founding members.', age: '32 min', unread: true },
    { id: 3, type: 'event', text: 'Vice Night starts tomorrow at 9:00 PM ET.', age: '1 hr', unread: true },
    { id: 4, type: 'vote', text: 'Your launch-night plan earned 100 new reputation.', age: '3 hr', unread: false }
  ]
};

let state = loadState();
const root = document.querySelector('#view-root');
const title = document.querySelector('#view-title');
const kicker = document.querySelector('#view-kicker');
const composer = document.querySelector('#composer-dialog');
const profile = document.querySelector('#profile-dialog');
const searchInput = document.querySelector('#search-input');

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...structuredClone(seed), ...saved } : structuredClone(seed);
  } catch {
    return structuredClone(seed);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function toast(message) {
  const region = document.querySelector('#toast-region');
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = message;
  region.append(item);
  setTimeout(() => item.remove(), 2600);
}

function renderChrome() {
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === state.activeView));
  document.querySelector('#district-list').innerHTML = state.districts.map(d => `<button class="${state.activeDistrict === d.name ? 'active' : ''}" data-district="${escapeHtml(d.name)}"><span>${escapeHtml(d.name)}</span><span>${d.count}</span></button>`).join('');
  document.querySelector('#composer-district').innerHTML = state.districts.slice(1).map(d => `<option>${escapeHtml(d.name)}</option>`).join('') + '<option>Citywide</option>';
  document.querySelector('#trending-list').innerHTML = [...state.threads].sort((a,b) => b.votes - a.votes).slice(0,4).map((thread,index) => `<li data-thread="${thread.id}"><span>0${index+1}</span><div><strong>${escapeHtml(thread.title)}</strong><small>${thread.votes.toLocaleString()} heat · ${thread.replies} replies</small></div></li>`).join('');
  const unread = state.notificationsRead ? 0 : state.notifications.filter(n => n.unread).length;
  document.querySelector('#notification-count').textContent = unread;
  document.querySelector('#notification-count').hidden = unread === 0;
}

function setView(view) {
  state.activeView = view;
  saveState();
  render();
}

function render() {
  renderChrome();
  const views = {
    home: renderHome,
    discover: renderDiscover,
    crews: renderCrews,
    events: renderEvents,
    saved: renderSaved,
    notifications: renderNotifications
  };
  (views[state.activeView] || renderHome)();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function pageHeading(name, text, label = 'EXPLORE THE CITY') {
  title.textContent = name;
  kicker.textContent = label;
  return `<div class="page-intro"><p class="eyebrow">${label}</p><h3>${escapeHtml(name)}</h3><p>${escapeHtml(text)}</p></div>`;
}

function renderHome() {
  title.textContent = state.activeDistrict === 'All Districts' ? 'City Feed' : state.activeDistrict;
  kicker.textContent = 'LIVE FROM THE CITY';
  const filtered = state.threads.filter(t => state.activeDistrict === 'All Districts' || t.district === state.activeDistrict || t.district === 'Citywide');
  root.innerHTML = `
    <section class="hero-card">
      <div><span class="status-pill">FOUNDING SEASON</span><h3>THE CITY IS<br>ALREADY ALIVE.</h3><p>Vice City Forums is the community layer for GTA VI: districts, crews, discoveries, events, reputation, clips, guides, and the stories players create together.</p><div class="hero-actions"><button class="primary-button" data-action="new-post">Enter the Conversation</button><button class="ghost-button" data-view="crews">Find Your Crew</button></div></div>
      <div class="hero-stat"><strong>18.4K</strong><span>founding citizens</span></div>
    </section>
    <div class="feed-toolbar"><div class="filter-row"><button class="filter-chip active" data-filter="hot">Hot</button><button class="filter-chip" data-filter="new">New</button><button class="filter-chip" data-filter="top">Top</button><button class="filter-chip" data-filter="unanswered">Unanswered</button></div><span class="form-note">${filtered.length} active discussions</span></div>
    <section class="feed-grid" id="feed">${filtered.map(threadCard).join('')}</section>`;
}

function threadCard(thread) {
  const isSaved = state.saved.includes(thread.id);
  return `<article class="thread-card ${thread.featured ? 'featured' : ''}" data-thread="${thread.id}">
    <div class="thread-meta"><span class="badge ${thread.tier}">${thread.tier.toUpperCase()}</span><span>${escapeHtml(thread.district)}</span><span>${thread.age}</span>${thread.spoiler ? '<span class="badge danger">SPOILER</span>' : ''}</div>
    <h3>${escapeHtml(thread.title)}</h3><p>${escapeHtml(thread.body)}</p>
    <footer><span>${escapeHtml(thread.author)} · ${escapeHtml(thread.role)}</span><div class="thread-actions"><button data-action="vote" data-id="${thread.id}">▲ ${thread.votes}</button><button data-action="reply" data-id="${thread.id}">◌ ${thread.replies}</button><button class="${isSaved ? 'active' : ''}" data-action="save" data-id="${thread.id}">${isSaved ? '★' : '☆'}</button></div></footer>
  </article>`;
}

function renderDiscover() {
  const query = searchInput.value.trim().toLowerCase();
  const matches = state.threads.filter(t => !query || `${t.title} ${t.body} ${t.district} ${t.author}`.toLowerCase().includes(query));
  root.innerHTML = pageHeading('Discover', 'Search across districts, creators, guides, theories, crews, and live community conversations.') + `<div class="feed-toolbar"><div class="filter-row">${state.districts.slice(1).map(d => `<button class="filter-chip" data-district="${escapeHtml(d.name)}">${escapeHtml(d.name)}</button>`).join('')}</div><span class="form-note">${matches.length} results</span></div><section class="feed-grid">${matches.length ? matches.map(threadCard).join('') : emptyState('No discussions found', 'Try a broader search or publish the first post on this subject.')}</section>`;
}

function renderCrews() {
  root.innerHTML = pageHeading('Crews', 'Build a persistent identity with people who play, create, race, investigate, roleplay, or explore the same way you do.') + `<section class="card-grid">${state.crews.map(crew => { const joined = state.joinedCrews.includes(crew.id); return `<article class="crew-card"><div class="crew-banner"></div><div class="thread-meta"><span class="badge rare">${crew.type.toUpperCase()}</span><span>${crew.district}</span></div><h3>${escapeHtml(crew.name)}</h3><p>${escapeHtml(crew.description)}</p><div class="card-footer"><div class="stacked-avatars"><span>MV</span><span>SR</span><span>BB</span><span>+${crew.members-3}</span></div><button class="${joined ? 'ghost-button' : 'primary-button'}" data-action="join-crew" data-id="${crew.id}">${joined ? 'Joined' : 'Join Crew'}</button></div></article>`; }).join('')}</section>`;
}

function renderEvents() {
  root.innerHTML = pageHeading('Events', 'Watch parties, creator challenges, tournaments, map investigations, crew drafts, and community launch operations.') + `<section class="card-grid">${state.events.map(event => { const attending = state.attendingEvents.includes(event.id); return `<article class="event-card"><div class="event-banner"></div><div class="thread-meta"><span class="badge legendary">LIVE EVENT</span><span>${event.date}</span></div><h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.description)}</p><div class="event-meta"><span>Hosted by ${escapeHtml(event.host)}</span><span>${(event.going + (attending ? 1 : 0)).toLocaleString()} going</span></div><button class="${attending ? 'ghost-button' : 'primary-button'} full" data-action="attend-event" data-id="${event.id}">${attending ? 'Going ✓' : 'RSVP'}</button></article>`; }).join('')}</section>`;
}

function renderSaved() {
  const savedThreads = state.threads.filter(t => state.saved.includes(t.id));
  root.innerHTML = pageHeading('Saved', 'Your private collection of discussions, guides, theories, media, and community resources.') + `<section class="feed-grid">${savedThreads.length ? savedThreads.map(threadCard).join('') : emptyState('Nothing saved yet', 'Use the star on any discussion to keep it here.')}</section>`;
}

function renderNotifications() {
  state.notificationsRead = true;
  saveState();
  renderChrome();
  root.innerHTML = pageHeading('Notifications', 'Replies, reputation, crew activity, event reminders, moderation updates, and city announcements.', 'YOUR CITY SIGNAL') + state.notifications.map(n => `<article class="notification-card ${n.unread ? 'unread' : ''}"><div class="notification-icon">${({reply:'◌',crew:'♟',event:'◇',vote:'▲'})[n.type] || '•'}</div><div><p>${escapeHtml(n.text)}</p><span class="form-note">${n.age}</span></div></article>`).join('');
}

function emptyState(name, text) {
  return `<div class="empty-state"><strong>${escapeHtml(name)}</strong><p>${escapeHtml(text)}</p><button class="primary-button" data-action="new-post">Create a Post</button></div>`;
}

function publishPost() {
  const form = document.querySelector('#composer-form');
  const data = new FormData(form);
  const titleValue = String(data.get('title') || '').trim();
  const body = String(data.get('body') || '').trim();
  if (!titleValue || !body) return;
  state.threads.unshift({ id: Date.now(), title: titleValue, body, district: String(data.get('district') || 'Citywide'), author: 'Brother Big', role: 'City Founder', replies: 0, votes: 1, age: 'just now', tier: 'uncommon', featured: true, spoiler: data.get('spoiler') === 'on' });
  saveState();
  form.reset();
  state.activeView = 'home';
  render();
  toast('Your post is live in the city.');
}

function handleAction(action, id) {
  if (action === 'new-post') composer.showModal();
  if (action === 'profile') profile.showModal();
  if (action === 'close-profile') profile.close();
  if (action === 'notifications') setView('notifications');
  if (action === 'save') {
    const threadId = Number(id);
    state.saved = state.saved.includes(threadId) ? state.saved.filter(x => x !== threadId) : [...state.saved, threadId];
    saveState(); render(); toast(state.saved.includes(threadId) ? 'Saved to your collection.' : 'Removed from saved.');
  }
  if (action === 'vote') {
    const thread = state.threads.find(t => t.id === Number(id));
    if (thread) { thread.votes += 1; saveState(); render(); toast('Reputation added.'); }
  }
  if (action === 'reply') toast('Thread view and nested replies are next in the production backend.');
  if (action === 'join-crew') {
    const crewId = Number(id);
    state.joinedCrews = state.joinedCrews.includes(crewId) ? state.joinedCrews.filter(x => x !== crewId) : [...state.joinedCrews, crewId];
    saveState(); render(); toast(state.joinedCrews.includes(crewId) ? 'Welcome to the crew.' : 'You left the crew.');
  }
  if (action === 'attend-event') {
    const eventId = Number(id);
    state.attendingEvents = state.attendingEvents.includes(eventId) ? state.attendingEvents.filter(x => x !== eventId) : [...state.attendingEvents, eventId];
    saveState(); render(); toast(state.attendingEvents.includes(eventId) ? 'Event added to your city calendar.' : 'RSVP removed.');
  }
  if (action === 'district-info') toast('District pages will gain moderators, guides, events, and local reputation boards.');
}

document.addEventListener('click', event => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) return setView(viewButton.dataset.view);
  const districtButton = event.target.closest('[data-district]');
  if (districtButton) { state.activeDistrict = districtButton.dataset.district; state.activeView = 'home'; saveState(); return render(); }
  const actionButton = event.target.closest('[data-action]');
  if (actionButton) { event.preventDefault(); event.stopPropagation(); return handleAction(actionButton.dataset.action, actionButton.dataset.id); }
  const thread = event.target.closest('[data-thread]');
  if (thread) toast('Opening full thread pages is the next production milestone.');
});

document.querySelector('#composer-form').addEventListener('submit', event => {
  const submitter = event.submitter?.value;
  if (submitter === 'publish') { event.preventDefault(); publishPost(); composer.close(); }
});

searchInput.addEventListener('input', () => {
  if (searchInput.value && state.activeView !== 'discover') state.activeView = 'discover';
  render();
});

setInterval(() => {
  const online = document.querySelector('#online-count');
  if (online) online.textContent = (2846 + Math.floor(Math.random() * 36 - 18)).toLocaleString();
}, 5000);

render();