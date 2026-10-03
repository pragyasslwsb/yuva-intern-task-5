'use strict';

// Demo content lives in one list so every page uses consistent destination details.
const destinations = [
  {
    id: 'cedar-house', name: 'Cedar House', location: 'Mount Hood, Oregon', category: 'Cabin',
    duration: '2–3 nights', price: '$185', rating: '4.98', image: 'assets/forest.svg',
    description: 'A little timber cabin tucked into old-growth forest. Wake to birdsong, spend the afternoon on a quiet trail, and save the evening for the wood-fired tub.',
    season: 'All seasons', quote: 'The kind of quiet that stays with you on the drive home.'
  },
  {
    id: 'salt-house', name: 'Salt House', location: 'Big Sur, California', category: 'Coast',
    duration: '3 nights', price: '$240', rating: '4.96', image: 'assets/coast.svg',
    description: 'A sun-warmed hideaway perched above the Pacific. Take the long way down to the water, pack a picnic, and let the ocean set your schedule.',
    season: 'Spring–fall', quote: 'Salt in your hair, absolutely nowhere to be.'
  },
  {
    id: 'juniper-camp', name: 'Juniper Camp', location: 'Joshua Tree, California', category: 'Desert',
    duration: '2 nights', price: '$160', rating: '4.94', image: 'assets/desert.svg',
    description: 'A design-minded desert stay with big skies and even bigger stars. Slow mornings, warm rock underfoot, and a campfire when the sun goes down.',
    season: 'October–April', quote: 'The desert makes a very good case for doing less.'
  },
  {
    id: 'blue-hour', name: 'Blue Hour Lodge', location: 'Lake Tahoe, California', category: 'Mountain',
    duration: '2–4 nights', price: '$210', rating: '4.91', image: 'assets/alpine.svg',
    description: 'A thoughtful basecamp by the lake, made for early swims and last-light walks. Everything you need, and just enough room to breathe.',
    season: 'All seasons', quote: 'First coffee by the water. Last light on the ridge.'
  },
  {
    id: 'little-marais', name: 'Little Marais', location: 'North Shore, Minnesota', category: 'Cabin',
    duration: '3 nights', price: '$175', rating: '4.97', image: 'assets/lake.svg',
    description: 'A small, slow cabin close to the big water. Follow the shoreline trail, find a new favorite rock, and make a proper dinner with the windows open.',
    season: 'May–October', quote: 'A lake, a book, and no reason to check the time.'
  },
  {
    id: 'casa-sol', name: 'Casa Sol', location: 'Santa Fe, New Mexico', category: 'Desert',
    duration: '2 nights', price: '$195', rating: '4.93', image: 'assets/casa.svg',
    description: 'Adobe walls, a sunny courtyard, and the high-desert light that makes everything feel a little more possible. Walk to the plaza, then take the scenic way back.',
    season: 'All seasons', quote: 'A slower pace, with a little extra sunshine.'
  }
];

const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const favorites = new Set();
let storageAvailable = true;
let toastTimer;

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem('northstar-saved') || '[]');
    if (!Array.isArray(saved) || saved.some((id) => typeof id !== 'string')) {
      throw new Error('Saved trip data has an unexpected format.');
    }
    saved.filter((id) => destinations.some((destination) => destination.id === id))
      .forEach((id) => favorites.add(id));
  } catch (error) {
    storageAvailable = false;
    console.error('Unable to read saved trips from browser storage:', error);
  }
}

// Routes use query parameters so direct links and refreshes work on simple static hosting.
function routeUrl(page, params = {}) {
  const query = new URLSearchParams({ page, ...params });
  return `${window.location.pathname}?${query.toString()}`;
}

function currentRoute() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page') || 'home';
  return {
    page,
    id: params.get('id') || '',
    query: (params.get('q') || '').trim(),
    category: params.get('category') || 'All'
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

// Cards are shared by Home, Explore, Saved, and search results.
function cardMarkup(destination) {
  const saved = favorites.has(destination.id);
  return `
    <article class="destination-card">
      <a class="card-image" href="${routeUrl('destination', { id: destination.id })}" aria-label="View ${escapeHtml(destination.name)}">
        <img src="${escapeHtml(destination.image)}" alt="${escapeHtml(destination.name)} surrounded by its natural landscape">
        <span class="card-tag">${escapeHtml(destination.category)}</span>
      </a>
      <button class="save-button" type="button" data-action="toggle-save" data-id="${escapeHtml(destination.id)}"
        aria-label="${saved ? 'Remove' : 'Save'} ${escapeHtml(destination.name)} ${saved ? 'from' : 'to'} saved trips"
        aria-pressed="${saved}">${saved ? '♥' : '♡'}</button>
      <div class="card-body">
        <span class="card-location">${escapeHtml(destination.location)}</span>
        <div class="card-title-row">
          <h3><a href="${routeUrl('destination', { id: destination.id })}">${escapeHtml(destination.name)}</a></h3>
          <span class="rating" aria-label="Rated ${destination.rating} out of 5">★ ${destination.rating}</span>
        </div>
        <div class="card-meta">
          <span>${escapeHtml(destination.duration)}</span>
          <span>from <strong>${escapeHtml(destination.price)}</strong> / night</span>
        </div>
      </div>
    </article>`;
}

function destinationGrid(items) {
  if (!items.length) {
    return `<div class="saved-empty">
      <span class="empty-icon" aria-hidden="true">⌕</span>
      <h2>No escapes found <em>(yet).</em></h2>
      <p>Try a different search or clear your filters to see all the places.</p>
      <a class="button-secondary" href="${routeUrl('explore')}">Clear filters</a>
    </div>`;
  }
  return `<div class="destination-grid">${items.map(cardMarkup).join('')}</div>`;
}

function homePage() {
  const featured = destinations.slice(0, 3);
  return `
    <div class="page-enter">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <span class="eyebrow">Little trips. Big exhale.</span>
          <h1 id="hero-title">Find a little<br>room to <em>roam.</em></h1>
          <p class="hero-description">Thoughtful places to stay, picked for the feeling you’ll bring home. Your next good story starts closer than you think.</p>
          <div class="hero-actions">
            <a class="button-primary" href="${routeUrl('explore')}">Explore getaways <span aria-hidden="true">↗</span></a>
            <a class="text-link" href="${routeUrl('about')}">Our way of wandering <span aria-hidden="true">→</span></a>
          </div>
          <div class="hero-proof" aria-label="Loved by more than 2,400 happy travelers">
            <span class="avatar-stack" aria-hidden="true"><span class="avatar">AL</span><span class="avatar">MJ</span><span class="avatar">SK</span><span class="avatar">+</span></span>
            <span><strong>2,400+</strong> happy little getaways</span>
          </div>
        </div>
        <div class="hero-art">
          <img src="assets/hero.svg" alt="A quiet mountain lake at sunset, ringed by pine trees">
          <div class="floating-note"><span class="note-icon" aria-hidden="true">✳</span><strong>Your kind of quiet</strong><span>Handpicked, never hurried.</span></div>
          <div class="art-label"><div><strong>Somewhere, Oregon</strong><span>A cabin between the trees</span></div><span class="art-coordinates">45° 22′ N · 121° 42′ W</span></div>
        </div>
      </section>
      <div class="trust-strip" aria-label="Northstar at a glance">
        <span class="trust-copy"><strong>Good places, good people.</strong> A little getaway goes a long way.</span>
        <div class="trust-stat"><strong>4.9/5</strong><span>guest-loved stays</span></div>
        <div class="trust-stat"><strong>120+</strong><span>thoughtful places</span></div>
        <div class="trust-stat"><strong>Zero</strong><span>planning overwhelm</span></div>
      </div>
      <section class="section" aria-labelledby="featured-title">
        <div class="section-heading">
          <div><span class="eyebrow">A good place to start</span><h2 id="featured-title">Get out there, <em>gently.</em></h2></div>
          <p>Small stays with a big sense of place. Here are a few we can’t stop thinking about.</p>
        </div>
        ${destinationGrid(featured)}
      </section>
    </div>`;
}

function explorePage(route) {
  const search = route.query.toLocaleLowerCase();
  const items = destinations.filter((destination) => {
    const matchesSearch = !search || `${destination.name} ${destination.location} ${destination.category}`.toLocaleLowerCase().includes(search);
    const matchesCategory = route.category === 'All' || destination.category === route.category;
    return matchesSearch && matchesCategory;
  });
  return `
    <div class="page-enter">
      <section class="page-intro">
        <span class="eyebrow">The good kind of getting away</span>
        <h1>Somewhere good is<br><em>closer than you think.</em></h1>
        <p>Little cabins, coast-side hideaways, and places to slow the whole thing down.</p>
      </section>
      <section class="section explore-section" aria-label="Search destinations">
        <form class="search-panel" id="search-form">
          <div class="field"><label for="destination-search">I’m dreaming of…</label><input id="destination-search" name="q" type="search" placeholder="Try “coast” or “Oregon”" value="${escapeHtml(route.query)}"></div>
          <div class="field"><label for="category-filter">A little bit of…</label><select id="category-filter" name="category">
            ${['All', 'Cabin', 'Coast', 'Desert', 'Mountain'].map((category) => `<option value="${category}" ${route.category === category ? 'selected' : ''}>${category === 'All' ? 'Anywhere' : category}</option>`).join('')}
          </select></div>
          <button class="button-primary" type="submit">Find my somewhere <span aria-hidden="true">→</span></button>
        </form>
        <p class="results-note" aria-live="polite">${items.length} ${items.length === 1 ? 'place' : 'places'} to fall for</p>
        ${destinationGrid(items)}
      </section>
    </div>`;
}

function savedPage() {
  const items = destinations.filter((destination) => favorites.has(destination.id));
  return `
    <div class="page-enter">
      <section class="page-intro">
        <span class="eyebrow">Your little shortlist</span>
        <h1>Places to keep<br><em>close.</em></h1>
        <p>Save the getaways that make you stop scrolling. They’ll be waiting right here.</p>
      </section>
      <section class="section explore-section" aria-label="Saved getaways">
        ${items.length ? destinationGrid(items) : `
          <div class="saved-empty">
            <span class="empty-icon" aria-hidden="true">♡</span>
            <h2>Nothing tucked away <em>(yet).</em></h2>
            <p>Tap the little heart on a place you love. We’ll keep your shortlist right here on this device.</p>
            <a class="button-primary" href="${routeUrl('explore')}">Find a place to save <span aria-hidden="true">→</span></a>
          </div>`}
      </section>
    </div>`;
}

function detailPage(id) {
  const destination = destinations.find((item) => item.id === id);
  if (!destination) return notFoundPage();
  const saved = favorites.has(destination.id);
  return `
    <div class="page-enter">
      <section class="detail-hero">
        <div class="detail-image"><img src="${escapeHtml(destination.image)}" alt="${escapeHtml(destination.name)} in ${escapeHtml(destination.location)}"></div>
        <div class="detail-copy">
          <a class="back-link" href="${routeUrl('explore')}"><span aria-hidden="true">←</span> Back to all getaways</a>
          <span class="eyebrow">${escapeHtml(destination.category)} · ${escapeHtml(destination.location)}</span>
          <h1>${escapeHtml(destination.name)}<br><em>your pace.</em></h1>
          <p>${escapeHtml(destination.description)}</p>
          <div class="detail-facts">
            <div class="detail-fact"><strong>${escapeHtml(destination.duration)}</strong><span>just-right stay</span></div>
            <div class="detail-fact"><strong>${escapeHtml(destination.price)}</strong><span>starting per night</span></div>
            <div class="detail-fact"><strong>${escapeHtml(destination.season)}</strong><span>best little window</span></div>
          </div>
          <div class="detail-actions">
            <button class="button-primary" type="button" data-action="toggle-save" data-id="${escapeHtml(destination.id)}" aria-pressed="${saved}">
              ${saved ? '♥ Saved to your list' : '♡ Save this getaway'}
            </button>
            <a class="button-secondary" href="${routeUrl('explore')}">Keep exploring</a>
          </div>
          <blockquote class="detail-quote">“${escapeHtml(destination.quote)}”</blockquote>
        </div>
      </section>
    </div>`;
}

function aboutPage() {
  return `
    <div class="page-enter">
      <section class="page-intro"><span class="eyebrow">A note from Northstar</span><h1>We believe in<br><em>the little getaway.</em></h1>
        <p>Not every good trip needs a boarding pass. Sometimes, the best thing you can do is go a little less far.</p>
      </section>
      <section class="section about-grid">
        <div class="about-art"><img src="assets/lake.svg" alt="Golden evening light falling across a quiet northern lake"></div>
        <div class="about-copy">
          <span class="eyebrow">A softer way to go</span>
          <h2>More outside.<br>More <em>yourself.</em></h2>
          <p>Northstar is a small collection of stays chosen for the things that don’t fit in a star rating: the porch light at dusk, the trail that starts just past the gate, the kind of morning that makes you forget your phone exists.</p>
          <p>We believe in exploring close to home, leaving places as lovely as we found them, and choosing fewer, better things. Every stay on this little map has been picked with care.</p>
          <div class="values-list">
            <div class="value-item"><span class="value-icon" aria-hidden="true">✳</span><div><strong>Picked with a person in mind</strong><span>Real little places, considered by real humans.</span></div></div>
            <div class="value-item"><span class="value-icon" aria-hidden="true">✳</span><div><strong>Closer can be better</strong><span>Less getting there. More being there.</span></div></div>
            <div class="value-item"><span class="value-icon" aria-hidden="true">✳</span><div><strong>Room to be a good guest</strong><span>Thoughtful stays that care for their place.</span></div></div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="section-heading"><div><span class="eyebrow">A first step is a small step</span><h2>Your somewhere is <em>out there.</em></h2></div>
          <a class="button-primary" href="${routeUrl('explore')}">Browse getaways <span aria-hidden="true">↗</span></a>
        </div>
      </section>
    </div>`;
}

function notFoundPage() {
  return `<section class="not-found page-enter">
    <span class="eyebrow">A small detour</span><h1>We lost that trail.</h1>
    <p>That page or place isn’t on our map. Let’s find you somewhere good.</p>
    <a class="button-primary" href="${routeUrl('home')}">Back to the beginning <span aria-hidden="true">→</span></a>
  </section>`;
}

function updateNavigation(page) {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === page || (page === 'destination' && link.dataset.nav === 'explore')) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  document.querySelector('.saved-count').textContent = String(favorites.size);
}

function render({ focusMain = false, focusSaveId = '' } = {}) {
  const route = currentRoute();
  const pages = {
    home: homePage,
    explore: () => explorePage(route),
    saved: savedPage,
    destination: () => detailPage(route.id),
    about: aboutPage
  };
  app.setAttribute('aria-busy', 'true');
  app.innerHTML = (pages[route.page] || notFoundPage)();
  updateNavigation(route.page);
  app.setAttribute('aria-busy', 'false');
  document.title = ({
    home: 'Northstar — find room to roam',
    explore: 'Explore getaways — Northstar',
    saved: 'Your saved getaways — Northstar',
    destination: `${destinations.find((item) => item.id === route.id)?.name || 'Place not found'} — Northstar`,
    about: 'Our way of wandering — Northstar'
  })[route.page] || 'Page not found — Northstar';
  if (focusSaveId) {
    const saveButton = [...app.querySelectorAll('[data-action="toggle-save"]')]
      .find((button) => button.dataset.id === focusSaveId);
    (saveButton || document.querySelector('#main')).focus({ preventScroll: true });
  }
  if (focusMain) document.querySelector('#main').focus({ preventScroll: true });
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function persistFavorites() {
  if (!storageAvailable) {
    showToast('Saved trips are only available for this visit because browser storage is unavailable.');
    return;
  }
  try {
    localStorage.setItem('northstar-saved', JSON.stringify([...favorites]));
  } catch (error) {
    storageAvailable = false;
    console.error('Unable to save trips to browser storage:', error);
    showToast('We couldn’t save that trip on this device. Please check your browser storage settings.');
  }
}

// Update browser history first, then derive the visible page from the new URL.
function navigate(url, { replace = false, focusMain = true } = {}) {
  if (replace) window.history.replaceState({}, '', url);
  else window.history.pushState({}, '', url);
  render({ focusMain });
  if (focusMain) window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delegation keeps click handling active after the #app content is re-rendered.
document.addEventListener('click', (event) => {
  const saveButton = event.target.closest('[data-action="toggle-save"]');
  if (saveButton) {
    const id = saveButton.dataset.id;
    if (!destinations.some((destination) => destination.id === id)) {
      showToast('That place is no longer available.');
      return;
    }
    if (favorites.has(id)) {
      favorites.delete(id);
      showToast('Removed from your saved getaways.');
    } else {
      favorites.add(id);
      showToast('Saved for a little later. Find it in your shortlist.');
    }
    persistFavorites();
    render({ focusSaveId: id });
    return;
  }

  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin || destination.pathname !== window.location.pathname) return;
  event.preventDefault();
  navigate(`${destination.pathname}${destination.search}${destination.hash}`);
});

document.addEventListener('submit', (event) => {
  if (event.target.id !== 'search-form') return;
  event.preventDefault();
  const form = new FormData(event.target);
  const q = String(form.get('q') || '').trim();
  const category = String(form.get('category') || 'All');
  navigate(routeUrl('explore', { q, category }));
});

// Back and Forward change the URL outside navigate(), so redraw from that URL.
window.addEventListener('popstate', () => render());

// Restore saved state before the first render so cards show the correct heart state.
loadFavorites();
render();
if (!storageAvailable) showToast('Browser storage is unavailable; saved trips will only last for this visit.');
