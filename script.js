// =============================================
//  AWAAZ INDIA — script.js
// =============================================

// ── AUTH MODAL ──────────────────────────────
let currentTab = 'signup';

function openModal(tab) {
  document.getElementById('authModal').classList.add('active');
  document.getElementById('successMsg').classList.remove('show');
  document.getElementById('authForm').style.display = 'block';
  switchTab(tab);
}

function closeModal() {
  document.getElementById('authModal').classList.remove('active');
}

function switchTab(tab) {
  currentTab = tab;
  const signupFields = document.getElementById('signupFields');
  const authBtn      = document.getElementById('authBtn');
  const modalTitle   = document.getElementById('modalTitle');
  const modalSub     = document.getElementById('modalSub');

  if (tab === 'signup') {
    document.getElementById('signupTab').classList.add('active');
    document.getElementById('loginTab').classList.remove('active');
    signupFields.style.display = 'block';
    authBtn.textContent    = '🇮🇳 Create My Account';
    modalTitle.textContent = 'JOIN INDIA';
    modalSub.textContent   = 'Create your free Awaaz India account';
  } else {
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('signupTab').classList.remove('active');
    signupFields.style.display = 'none';
    authBtn.textContent    = '🔐 Login to Awaaz India';
    modalTitle.textContent = 'WELCOME BACK';
    modalSub.textContent   = 'Login to your Awaaz India account';
  }
}

function handleAuth() {
  document.getElementById('authForm').style.display = 'none';
  document.getElementById('successMsg').classList.add('show');
  setTimeout(closeModal, 2500);
}

// Close modal when clicking outside
document.getElementById('authModal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// ── SUGGESTIONS ─────────────────────────────
function submitSuggestion() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function vote(btn) {
  btn.classList.toggle('voted');
  const countEl = btn.querySelector('.vote-count');
  const raw     = countEl.textContent;
  let count     = raw.includes('K')
    ? parseFloat(raw) * 1000
    : parseInt(raw);

  count = btn.classList.contains('voted') ? count + 1 : count - 1;

  countEl.textContent = count >= 1000
    ? (count / 1000).toFixed(1) + 'K'
    : count;
}

// ── SCROLL HELPER ───────────────────────────
function scrollTo(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// ── LIVE NEWS ───────────────────────────────
const RSS_FEEDS = {
  india:      'https://feeds.feedburner.com/ndtvnews-india-news',
  politics:   'https://feeds.feedburner.com/ndtvnews-india-news',
  economy:    'https://feeds.feedburner.com/ndtvnews-business-news',
  technology: 'https://feeds.feedburner.com/ndtvnews-tech-gadgets',
  sports:     'https://feeds.feedburner.com/ndtvnews-sports'
};

const CATEGORY_EMOJIS = ['🏛️','📰','🌏','💡','⚡','🎯','🔥','📊','🌾','🎓'];

function getEmoji() {
  return CATEGORY_EMOJIS[Math.floor(Math.random() * CATEGORY_EMOJIS.length)];
}

function timeAgo(dateStr) {
  const now  = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor((now - then) / 60000);
  if (isNaN(diff) || diff < 0) return 'Just now';
  if (diff < 60)   return diff + ' min ago';
  if (diff < 1440) return Math.floor(diff / 60) + ' hours ago';
  return Math.floor(diff / 1440) + ' days ago';
}

function getCategoryTag(title) {
  const t = title.toLowerCase();
  if (t.includes('modi') || t.includes('parliament') || t.includes('bjp') ||
      t.includes('congress') || t.includes('election'))
    return ['tag-politics', 'Politics'];
  if (t.includes('rupee') || t.includes('gdp') || t.includes('market') ||
      t.includes('rbi') || t.includes('economy') || t.includes('bank'))
    return ['tag-economy', 'Economy'];
  if (t.includes('state') || t.includes('mumbai') || t.includes('delhi') ||
      t.includes('bengaluru') || t.includes('chennai'))
    return ['tag-state', 'State'];
  return ['tag-social', 'Social'];
}

async function loadNews(category, btn) {
  // Update active tab button
  document.querySelectorAll('.news-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.getElementById('newsLoading').style.display = 'block';
  document.getElementById('newsGrid').style.display    = 'none';
  document.getElementById('newsError').style.display   = 'none';

  const rssUrl = RSS_FEEDS[category] || RSS_FEEDS.india;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=public&count=8`;

  try {
    const res  = await fetch(apiUrl);
    const data = await res.json();

    if (!data.items || data.items.length === 0) throw new Error('No items');

    const items = data.items;

    // ── Featured article (first item) ──
    const featured        = items[0];
    const [ftag, flabel]  = getCategoryTag(featured.title);

    document.getElementById('featuredTitle').textContent = featured.title;
    document.getElementById('featuredDesc').textContent  = featured.description
      ? featured.description.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
      : 'Click to read the full article.';
    document.getElementById('featuredTag').textContent   = flabel;
    document.getElementById('featuredTag').className     = 'news-tag ' + ftag;
    document.getElementById('featuredTime').textContent  = '⏰ ' + timeAgo(featured.pubDate) + ' · NDTV';
    document.getElementById('featuredEmoji').textContent = getEmoji();
    document.getElementById('featuredNews').onclick      = () => window.open(featured.link, '_blank');

    // ── Sidebar items (next 3) ──
    const list = document.getElementById('newsList');
    list.innerHTML = '';
    items.slice(1, 4).forEach(item => {
      const [tag, label] = getCategoryTag(item.title);
      list.innerHTML += `
        <div class="news-item" onclick="window.open('${item.link}','_blank')">
          <div class="news-item-icon">${getEmoji()}</div>
          <div>
            <span class="news-tag ${tag}">${label}</span>
            <h4>${item.title.substring(0, 80)}${item.title.length > 80 ? '...' : ''}</h4>
            <p>${item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 80) + '...' : ''}</p>
            <div class="news-time">${timeAgo(item.pubDate)}</div>
          </div>
        </div>`;
    });

    document.getElementById('newsLoading').style.display = 'none';
    document.getElementById('newsGrid').style.display    = 'grid';

  } catch (e) {
    document.getElementById('newsLoading').style.display = 'none';
    document.getElementById('newsError').style.display   = 'block';
  }
}

// Load India news on page load
loadNews('india', null);
