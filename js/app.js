const navItems = document.querySelectorAll('.nav-item');
const viewTitle = document.querySelector('#view-title');
const dialog = document.querySelector('#new-post-dialog');
const newPostButton = document.querySelector('#new-post-button');

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((nav) => nav.classList.remove('active'));
    item.classList.add('active');
    viewTitle.textContent = item.textContent.trim();
  });
});

newPostButton?.addEventListener('click', () => dialog?.showModal());

dialog?.addEventListener('close', () => {
  if (dialog.returnValue !== 'publish') return;

  const form = dialog.querySelector('form');
  const data = new FormData(form);
  const title = String(data.get('title') || '').trim();
  const body = String(data.get('body') || '').trim();
  const district = String(data.get('district') || 'Citywide');

  if (!title || !body) return;

  const article = document.createElement('article');
  article.className = 'thread-card featured';
  article.innerHTML = `
    <div class="thread-meta">
      <span class="badge uncommon">NEW</span>
      <span>${escapeHtml(district)}</span>
      <span>just now</span>
    </div>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(body)}</p>
    <footer><span>BB · City Founder</span><span>0 replies</span></footer>
  `;

  document.querySelector('#feed')?.prepend(article);
  form.reset();
});

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);
}
