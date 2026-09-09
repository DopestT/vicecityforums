const SOURCE_LABELS = {
  'official-rockstar': 'OFFICIAL ROCKSTAR',
  'user-gameplay': 'USER GAMEPLAY',
  'fan-made': 'FAN-MADE',
  'ai-generated': 'AI-GENERATED',
};

const RELEASE_DATE = '2026-11-19';

function httpsUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function detectedProvider(value) {
  const safe = httpsUrl(value);
  if (!safe) return { provider: '', uid: '' };
  const url = new URL(safe);
  const host = url.hostname.toLowerCase();
  if (host === 'youtu.be') return { provider: 'youtube', uid: url.pathname.split('/').filter(Boolean)[0] || '' };
  if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com') {
    const pathId = url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/embed/')
      ? url.pathname.split('/').filter(Boolean)[1]
      : '';
    return { provider: 'youtube', uid: url.searchParams.get('v') || pathId || '' };
  }
  if (host.endsWith('.cloudflarestream.com') || host === 'cloudflarestream.com' || host.endsWith('.videodelivery.net') || host === 'videodelivery.net') {
    const uid = url.pathname.split('/').filter(Boolean).find(part => /^[a-f0-9]{20,64}$/i.test(part)) || '';
    return { provider: 'cloudflare', uid };
  }
  return { provider: 'external', uid: '' };
}

function slugify(value) {
  const base = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 78) || 'vice-city-clip';
  const suffix = globalThis.crypto?.randomUUID?.().slice(0, 8) || Math.random().toString(36).slice(2, 10);
  return `${base}-${suffix}`;
}

export function createClipsModule({
  supabase,
  view,
  modalRoot,
  toast,
  esc,
  setHead,
  setActive,
  getSession,
  getProfile,
  requireMember,
  openAuth,
  openOnboarding,
  goToThread,
}) {
  let observer = null;
  let keyHandler = null;
  let ratios = new Map();
  let clips = [];
  let engagement = new Map();
  let replyCounts = new Map();
  let soundOn = false;
  let requestToken = 0;
  const defaultTitle = document.title;

  function destroy() {
    requestToken += 1;
    observer?.disconnect();
    observer = null;
    ratios.clear();
    view.querySelectorAll('video').forEach(video => video.pause());
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    keyHandler = null;
    document.body.classList.remove('clips-mode');
    document.title = defaultTitle;
  }

  function mediaMarkup(clip) {
    const videoUrl = httpsUrl(clip.video_url);
    const posterUrl = httpsUrl(clip.poster_url);
    const poster = posterUrl ? ` poster="${esc(posterUrl)}"` : '';
    if (clip.provider === 'youtube' && /^[A-Za-z0-9_-]{6,20}$/.test(clip.provider_uid || '')) {
      const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(clip.provider_uid)}?playsinline=1&rel=0&modestbranding=1`;
      return `<iframe class="clip-embed" data-src="${src}" title="${esc(clip.title)}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    if (clip.provider === 'cloudflare' && videoUrl) {
      const host = new URL(videoUrl).hostname.toLowerCase();
      if (host.endsWith('.cloudflarestream.com') || host.endsWith('.videodelivery.net')) {
        return `<iframe class="clip-embed" data-src="${esc(videoUrl)}" title="${esc(clip.title)}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }
    }
    if (!videoUrl) return '<div class="clip-media-error">This clip is temporarily unavailable.</div>';
    return `<video class="clip-video" src="${esc(videoUrl)}"${poster} muted loop playsinline preload="metadata" controlslist="nodownload noremoteplayback" disablepictureinpicture aria-label="${esc(clip.title)}"></video>`;
  }

  function clipCard(clip) {
    const posterUrl = httpsUrl(clip.poster_url);
    const sourceUrl = httpsUrl(clip.source_url);
    const state = engagement.get(clip.id) || { liked: false, saved: false };
    const replies = replyCounts.get(clip.thread_id) || 0;
    const disclosure = clip.disclosure
      ? `<div class="clip-disclosure">${esc(clip.disclosure)}</div>`
      : '';
    return `<article class="clip-card" id="clip-${esc(clip.slug)}" data-clip-id="${esc(clip.id)}" data-clip-slug="${esc(clip.slug)}">
      <div class="clip-stage">
        <div class="clip-media-wrap">
          ${posterUrl ? `<img class="clip-backdrop" src="${esc(posterUrl)}" alt="" aria-hidden="true">` : ''}
          ${mediaMarkup(clip)}
          <div class="clip-vignette" aria-hidden="true"></div>
          <div class="clip-badges"><span class="clip-label source-${esc(clip.source_type)}">${esc(SOURCE_LABELS[clip.source_type] || clip.source_type)}</span>${clip.is_featured ? '<span class="clip-label featured">FEATURED</span>' : ''}</div>
          ${clip.provider === 'external' ? '<button class="clip-sound" type="button" data-clip-action="sound" aria-label="Turn sound on">MUTED</button>' : ''}
          <div class="clip-copy">
            ${disclosure}
            <div class="clip-credit">${esc(clip.creator_credit)}</div>
            <h2>${esc(clip.title)}</h2>
            <p>${esc(clip.description || '')}</p>
            ${sourceUrl ? `<a class="clip-source" href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer nofollow">VIEW ORIGINAL SOURCE ↗</a>` : ''}
          </div>
          <div class="clip-media-error" hidden>Video could not load. The original source remains available below.</div>
        </div>
        <nav class="clip-actions" aria-label="Clip actions">
          <button type="button" data-clip-action="like" class="${state.liked ? 'active' : ''}" aria-pressed="${state.liked}" aria-label="Like ${esc(clip.title)}"><span>♥</span><b data-clip-count="like">${Number(clip.like_count) || 0}</b></button>
          <button type="button" data-clip-action="save" class="${state.saved ? 'active' : ''}" aria-pressed="${state.saved}" aria-label="Save ${esc(clip.title)}"><span>▰</span><b data-clip-count="save">${Number(clip.save_count) || 0}</b></button>
          <button type="button" data-clip-action="discuss" aria-label="Discuss ${esc(clip.title)}"><span>☵</span><b>${replies}</b></button>
          <button type="button" data-clip-action="share" aria-label="Share ${esc(clip.title)}"><span>↗</span><b>SHARE</b></button>
          <button type="button" data-clip-action="report" aria-label="Report ${esc(clip.title)}"><span>•••</span><b>REPORT</b></button>
        </nav>
      </div>
    </article>`;
  }

  async function loadEngagement(clipIds) {
    engagement = new Map();
    const session = getSession();
    if (!session || !clipIds.length) return;
    const { data, error } = await supabase
      .from('clip_engagements')
      .select('clip_id,liked,saved')
      .eq('user_id', session.user.id)
      .in('clip_id', clipIds);
    if (error) throw error;
    (data || []).forEach(row => engagement.set(row.clip_id, { liked: row.liked, saved: row.saved }));
  }

  async function loadReplyCounts(threadIds) {
    replyCounts = new Map();
    if (!threadIds.length) return;
    const { data, error } = await supabase.from('threads').select('id,reply_count').in('id', threadIds);
    if (error) throw error;
    (data || []).forEach(row => replyCounts.set(row.id, Number(row.reply_count) || 0));
  }

  function setActiveVideo(card) {
    const slug = card?.dataset.clipSlug;
    view.querySelectorAll('.clip-card').forEach(item => {
      const video = item.querySelector('.clip-video');
      const embed = item.querySelector('.clip-embed');
      const active = item === card;
      item.classList.toggle('active', active);
      if (video) {
        if (active) {
          video.muted = !soundOn;
          video.play().catch(() => {});
        } else {
          video.pause();
          video.muted = true;
        }
      }
      if (embed) {
        if (active && !embed.hasAttribute('src')) embed.src = embed.dataset.src;
        if (!active && embed.hasAttribute('src')) embed.removeAttribute('src');
      }
    });
    if (slug) {
      history.replaceState(null, '', `#clips/${encodeURIComponent(slug)}`);
      const current = clips.find(clip => clip.slug === slug);
      if (current) document.title = `${current.title} | Vice City Clips`;
    }
    updateSoundButtons();
  }

  function chooseActiveCard() {
    const ranked = [...ratios.entries()].sort((a, b) => b[1] - a[1]);
    if (ranked[0]?.[1] >= 0.52) setActiveVideo(ranked[0][0]);
  }

  function startPlayback(initialSlug) {
    const feed = view.querySelector('.clips-feed');
    const cards = [...view.querySelectorAll('.clip-card')];
    if (!feed || !cards.length) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => ratios.set(entry.target, entry.intersectionRatio));
      chooseActiveCard();
    }, { root: feed, threshold: [0, 0.25, 0.52, 0.72, 1] });
    cards.forEach(card => observer.observe(card));
    view.querySelectorAll('.clip-video').forEach(video => {
      video.addEventListener('click', () => video.paused ? video.play().catch(() => {}) : video.pause());
      video.addEventListener('error', () => {
        const error = video.closest('.clip-media-wrap')?.querySelector('.clip-media-error');
        if (error) error.hidden = false;
      });
    });

    const target = initialSlug ? view.querySelector(`#clip-${CSS.escape(initialSlug)}`) : cards[0];
    requestAnimationFrame(() => {
      target?.scrollIntoView({ block: 'start' });
      setActiveVideo(target || cards[0]);
    });

    keyHandler = event => {
      if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) return;
      const active = view.querySelector('.clip-card.active') || cards[0];
      const index = cards.indexOf(active);
      const step = event.key === 'ArrowDown' || event.key === 'PageDown' ? 1 : -1;
      const next = cards[Math.max(0, Math.min(cards.length - 1, index + step))];
      if (next && next !== active) {
        event.preventDefault();
        next.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    document.addEventListener('keydown', keyHandler);
  }

  function updateSoundButtons() {
    view.querySelectorAll('[data-clip-action="sound"]').forEach(button => {
      const active = button.closest('.clip-card')?.classList.contains('active');
      button.textContent = active && soundOn ? 'SOUND ON' : 'MUTED';
      button.setAttribute('aria-label', soundOn ? 'Mute video' : 'Turn sound on');
    });
  }

  async function toggleEngagement(clip, kind, button) {
    if (!requireMember()) return;
    const session = getSession();
    const previous = engagement.get(clip.id) || { liked: false, saved: false };
    const next = { ...previous, [kind]: !previous[kind] };
    engagement.set(clip.id, next);
    const countKey = kind === 'liked' ? 'like' : 'save';
    const countNode = button.querySelector(`[data-clip-count="${countKey}"]`);
    const currentCount = Number(countNode?.textContent) || 0;
    button.classList.toggle('active', next[kind]);
    button.setAttribute('aria-pressed', String(next[kind]));
    if (countNode) countNode.textContent = String(Math.max(0, currentCount + (next[kind] ? 1 : -1)));

    let result;
    if (!next.liked && !next.saved) {
      result = await supabase.from('clip_engagements').delete().eq('clip_id', clip.id).eq('user_id', session.user.id);
    } else {
      result = await supabase.from('clip_engagements').upsert({
        clip_id: clip.id,
        user_id: session.user.id,
        liked: next.liked,
        saved: next.saved,
      }, { onConflict: 'clip_id,user_id' });
    }
    if (!result.error) return;

    engagement.set(clip.id, previous);
    button.classList.toggle('active', previous[kind]);
    button.setAttribute('aria-pressed', String(previous[kind]));
    if (countNode) countNode.textContent = String(currentCount);
    toast('That action could not be saved. Please try again.', true);
  }

  async function shareClip(clip) {
    const url = `${location.origin}/#clips/${encodeURIComponent(clip.slug)}`;
    const share = { title: clip.title, text: `${clip.title} — Vice City Clips`, url };
    try {
      if (navigator.share) await navigator.share(share);
      else {
        await navigator.clipboard.writeText(url);
        toast('Clip link copied.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') toast('Could not share this clip.', true);
    }
  }

  function openReport(clip) {
    if (!requireMember()) return;
    modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal"><button class="modal-close" aria-label="Close">×</button><div class="eyebrow">COMMUNITY SAFETY</div><h2>REPORT CLIP</h2><p class="muted">Tell the moderators what needs review. Reports are private.</p><form id="clip-report-form" class="form"><div class="field"><label>REASON</label><select name="reason" required><option value="misleading-label">Misleading source label</option><option value="copyright">Copyright or ownership</option><option value="graphic">Graphic or unsafe content</option><option value="harassment">Harassment</option><option value="spam">Spam</option><option value="other">Other</option></select></div><div class="field"><label>DETAILS <span class="muted">(optional)</span></label><textarea name="details" maxlength="1000"></textarea></div><div id="clip-report-message"></div><button class="btn" type="submit">SEND REPORT</button></form></div></div>`;
    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('.modal-close').onclick = close;
    modalRoot.querySelector('.modal-backdrop').onclick = event => { if (event.target === event.currentTarget) close(); };
    modalRoot.querySelector('#clip-report-form').onsubmit = async event => {
      event.preventDefault();
      const session = getSession();
      const form = new FormData(event.currentTarget);
      const message = modalRoot.querySelector('#clip-report-message');
      message.innerHTML = '<div class="notice">Sending report…</div>';
      const { error } = await supabase.from('clip_reports').insert({
        clip_id: clip.id,
        reporter_id: session.user.id,
        reason: String(form.get('reason')),
        details: String(form.get('details') || '').trim(),
      });
      if (error) {
        message.innerHTML = `<div class="notice error">${esc(error.code === '23505' ? 'You already reported this clip.' : error.message)}</div>`;
        return;
      }
      close();
      toast('Report sent to the moderators.');
    };
  }

  function openSubmission() {
    if (!getSession()) return openAuth('signup');
    if (!getProfile()?.onboarded) return openOnboarding();
    const gameplayOpen = new Date().toISOString().slice(0, 10) >= RELEASE_DATE;
    modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal clip-submit-modal"><button class="modal-close" aria-label="Close">×</button><div class="eyebrow">VICE CITY CLIPS</div><h2>SUBMIT A CLIP</h2><p class="muted">Every submission is reviewed before it appears. Direct file uploads are being activated; for now, submit an HTTPS MP4 or YouTube link.</p><form id="clip-submit-form" class="form"><div class="field"><label>TITLE</label><input name="title" minlength="4" maxlength="140" required></div><div class="field"><label>CLIP URL</label><input name="video_url" type="url" inputmode="url" placeholder="https://…mp4 or YouTube URL" required></div><div class="field"><label>POSTER IMAGE URL <span class="muted">(optional)</span></label><input name="poster_url" type="url" inputmode="url" placeholder="https://…jpg"></div><div class="field"><label>SOURCE LABEL</label><select name="source_type" required><option value="official-rockstar">Official Rockstar footage</option><option value="fan-made">Fan-made concept</option><option value="ai-generated">AI-generated</option><option value="user-gameplay" ${gameplayOpen ? '' : 'disabled'}>User gameplay ${gameplayOpen ? '' : '(available after launch)'}</option></select></div><div class="field"><label>ORIGINAL SOURCE URL</label><input name="source_url" type="url" inputmode="url" placeholder="Creator’s original post or official page" required></div><div class="field"><label>CREATOR CREDIT</label><input name="creator_credit" minlength="2" maxlength="160" placeholder="Original creator or Rockstar Games" required></div><div class="field"><label>CAPTURED / PUBLISHED DATE <span class="muted">(optional)</span></label><input name="captured_at" type="date"></div><div class="field"><label>DESCRIPTION</label><textarea name="description" maxlength="2000" placeholder="What happens, and what should the community discuss?"></textarea></div><label class="clip-rights"><input name="rights_attested" type="checkbox" required><span>I own this footage or have permission to share it, and the source and label above are accurate.</span></label><div id="clip-submit-message"></div><button class="btn" type="submit">SEND FOR REVIEW</button></form></div></div>`;
    const close = () => { modalRoot.innerHTML = ''; };
    modalRoot.querySelector('.modal-close').onclick = close;
    modalRoot.querySelector('.modal-backdrop').onclick = event => { if (event.target === event.currentTarget) close(); };
    modalRoot.querySelector('#clip-submit-form').onsubmit = async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const message = modalRoot.querySelector('#clip-submit-message');
      const title = String(form.get('title') || '').trim();
      const videoUrl = httpsUrl(form.get('video_url'));
      const sourceUrl = httpsUrl(form.get('source_url'));
      const posterValue = String(form.get('poster_url') || '').trim();
      const posterUrl = posterValue ? httpsUrl(posterValue) : null;
      const provider = detectedProvider(videoUrl);
      if (!videoUrl || !sourceUrl || (posterValue && !posterUrl)) {
        message.innerHTML = '<div class="notice error">Use complete HTTPS links for the clip, source, and optional poster.</div>';
        return;
      }
      if (provider.provider === 'external' && !/\.mp4(?:$|[?#])/i.test(videoUrl)) {
        message.innerHTML = '<div class="notice error">Use a direct HTTPS MP4 link or a YouTube link.</div>';
        return;
      }
      if (provider.provider === 'youtube' && !/^[A-Za-z0-9_-]{6,20}$/.test(provider.uid)) {
        message.innerHTML = '<div class="notice error">That YouTube link is not recognized.</div>';
        return;
      }
      message.innerHTML = '<div class="notice">Sending to the review queue…</div>';
      const { error } = await supabase.from('clips').insert({
        uploader_id: getSession().user.id,
        slug: slugify(title),
        title,
        description: String(form.get('description') || '').trim(),
        video_url: videoUrl,
        poster_url: posterUrl,
        source_type: String(form.get('source_type')),
        source_url: sourceUrl,
        creator_credit: String(form.get('creator_credit') || '').trim(),
        captured_at: String(form.get('captured_at') || '') || null,
        provider: provider.provider,
        provider_uid: provider.uid || null,
        rights_attested: Boolean(form.get('rights_attested')),
      });
      if (error) {
        message.innerHTML = `<div class="notice error">${esc(error.message)}</div>`;
        return;
      }
      close();
      toast('Clip submitted. It is now in moderator review.');
    };
  }

  function bindActions() {
    view.querySelector('[data-submit-clip]')?.addEventListener('click', openSubmission);
    view.querySelector('[data-join-clips]')?.addEventListener('click', () => openAuth('signup'));
    view.querySelectorAll('.clip-card').forEach(card => {
      const clip = clips.find(item => item.id === card.dataset.clipId);
      if (!clip) return;
      card.querySelectorAll('[data-clip-action]').forEach(button => {
        button.addEventListener('click', async event => {
          event.stopPropagation();
          const action = button.dataset.clipAction;
          if (action === 'like') await toggleEngagement(clip, 'liked', button);
          if (action === 'save') await toggleEngagement(clip, 'saved', button);
          if (action === 'discuss') {
            if (clip.thread_id) goToThread(clip.thread_id);
            else toast('Discussion is being prepared for this clip.');
          }
          if (action === 'share') await shareClip(clip);
          if (action === 'report') openReport(clip);
          if (action === 'sound') {
            soundOn = !soundOn;
            const activeVideo = view.querySelector('.clip-card.active .clip-video');
            if (activeVideo) {
              activeVideo.muted = !soundOn;
              activeVideo.play().catch(() => {});
            }
            updateSoundButtons();
          }
        });
      });
    });
  }

  async function show(initialSlug = '') {
    destroy();
    const token = requestToken;
    document.body.classList.add('clips-mode');
    setHead('vice-city-clips', 'Watch it. Label it. Debate it.');
    setActive('data-route', 'clips');
    view.innerHTML = '<div class="clips-loading"><div class="eyebrow">VICE CITY CLIPS</div><b>Loading the feed…</b></div>';
    try {
      const { data, error } = await supabase
        .from('clips')
        .select('id,uploader_id,thread_id,slug,title,description,video_url,poster_url,source_type,source_url,creator_credit,captured_at,provider,provider_uid,duration_seconds,disclosure,is_featured,like_count,save_count,published_at')
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(60);
      if (error) throw error;
      clips = data || [];
      await Promise.all([
        loadEngagement(clips.map(clip => clip.id)),
        loadReplyCounts([...new Set(clips.map(clip => clip.thread_id).filter(Boolean))]),
      ]);
      if (token !== requestToken) return;

      const emptyAction = getSession()
        ? '<button class="btn" type="button" data-submit-clip>SUBMIT A CLIP</button>'
        : '<button class="btn" type="button" data-join-clips>JOIN TO SUBMIT</button>';
      view.innerHTML = `<section class="clips-shell" aria-label="Vice City Clips">
        <header class="clips-toolbar"><div><span class="clips-live-dot"></span><b>VICE CITY CLIPS</b><small>Official, community, fan-made and AI footage—clearly labeled.</small></div><div class="clips-toolbar-actions"><a class="btn small ghost" href="gta-6-funny-clips">CLIP GUIDE</a>${getSession() ? '<button class="btn small" type="button" data-submit-clip>SUBMIT CLIP</button>' : '<button class="btn small" type="button" data-join-clips>JOIN TO SUBMIT</button>'}</div></header>
        <div class="clips-feed" tabindex="0">${clips.length ? clips.map(clipCard).join('') : `<div class="clips-empty"><div class="eyebrow">THE FEED IS OPEN</div><h1>FIRST CLIP WINS THE BLOCK.</h1><p>Approved clips will appear here with source labels, creator credit, and a connected forum discussion.</p>${emptyAction}</div>`}</div>
      </section>`;
      bindActions();
      startPlayback(initialSlug);
    } catch (error) {
      if (token !== requestToken) return;
      console.error(error);
      view.innerHTML = '<div class="content"><div class="notice error">Vice City Clips could not load. Refresh and try again.</div><p><a class="btn ghost" href="#category/clips-compilations">OPEN CLIPS &amp; COMPILATIONS FORUM</a></p></div>';
    }
  }

  return { show, destroy, openSubmission };
}
