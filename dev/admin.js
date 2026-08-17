/* ============================================================
   /dev editor. Reads and writes config.js (and assets) directly
   in the systemssight GitHub repo via the GitHub Contents API.

   NOTE ON SECURITY: this passcode gate is enforced entirely in
   client-side JS. It stops casual visitors, not a determined one —
   anyone can read this file and see how it works. Don't treat it
   as a real access control.
   ============================================================ */

const PASSCODE_HASH = '554bdf2423a61d37ec20b8436631eed2fa2363f2e439d3d6cab6b7403ce3587f';
const GH_OWNER = 'systemlover83';
const GH_REPO = 'systemssight';
const GH_BRANCH = 'master';
const GH_API = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`;
const RAW_BASE = `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/`;

const ICON_OPTIONS = ['link', 'music', 'play', 'controller'];
const PRESET_PLATFORMS = ['discord', 'twitter', 'instagram', 'tiktok', 'github', 'spotify', 'youtube', 'steam'];

let state = null;       // populated from live config.js
let pendingFiles = { avatar: null, backgroundMedia: null, musicTrack: null };

/* ---------------- passcode gate ---------------- */
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

document.getElementById('gate-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('gate-input').value;
  const hash = await sha256Hex(input);
  if (hash === PASSCODE_HASH) {
    sessionStorage.setItem('devUnlocked', '1');
    unlock();
  } else {
    document.getElementById('gate-error').hidden = false;
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  sessionStorage.removeItem('devUnlocked');
  location.reload();
});

function unlock() {
  document.getElementById('gate').hidden = true;
  document.getElementById('editor').hidden = false;
  initEditor();
}

if (sessionStorage.getItem('devUnlocked') === '1') unlock();

/* ---------------- token management ---------------- */
function getToken() { return localStorage.getItem('gh_pat') || ''; }

document.getElementById('btn-save-token').addEventListener('click', () => {
  const val = document.getElementById('gh-token').value.trim();
  if (val) localStorage.setItem('gh_pat', val);
  document.getElementById('gh-token').value = '';
  updateTokenStatus();
});
document.getElementById('btn-forget-token').addEventListener('click', () => {
  localStorage.removeItem('gh_pat');
  updateTokenStatus();
});
function updateTokenStatus() {
  document.getElementById('token-status').textContent = getToken()
    ? 'token saved in this browser.'
    : 'no token saved yet — required before publishing.';
}

/* ---------------- init / load current config ---------------- */
async function initEditor() {
  updateTokenStatus();
  setStatus('loading current config…', 'info');
  try {
    const res = await fetch(RAW_BASE + 'config.js?_=' + Date.now());
    const text = await res.text();
    state = extractConfig(text);
    populateForm(state);
    setStatus('loaded current live config.', 'ok');
  } catch (err) {
    setStatus('could not load live config: ' + err.message, 'err');
    state = defaultState();
    populateForm(state);
  }
}

function extractConfig(jsText) {
  const fn = new Function(jsText + '\nreturn CONFIG;');
  const c = fn();
  // deep-ish clone with fallbacks so missing fields never break the form
  const d = defaultState();
  return {
    profile: { ...d.profile, ...c.profile, badges: c.profile?.badges || [] },
    theme: { ...d.theme, ...c.theme },
    socials: {
      ...Object.fromEntries(PRESET_PLATFORMS.map(p => [p, { ...d.socials[p], ...(c.socials?.[p] || {}) }])),
      custom: c.socials?.custom || []
    },
    features: {
      musicPlayer: { ...d.features.musicPlayer, ...c.features?.musicPlayer },
      typewriterBio: { ...d.features.typewriterBio, ...c.features?.typewriterBio },
      customCursor: { ...d.features.customCursor, ...c.features?.customCursor },
      particleBackground: { ...d.features.particleBackground, ...c.features?.particleBackground },
      viewCounter: { ...d.features.viewCounter, ...c.features?.viewCounter },
      pageLock: { ...d.features.pageLock, ...c.features?.pageLock }
    }
  };
}

function defaultState() {
  return {
    profile: { displayName: '', handle: '', bio: '', avatar: 'assets/avatar-placeholder.svg', badges: [] },
    theme: { accent: '#a855f7', accent2: '#22d3ee', backgroundType: 'particles', backgroundMedia: '', introAnimation: 'fade' },
    socials: {
      discord: { enabled: false, value: '' }, twitter: { enabled: false, value: '' },
      instagram: { enabled: false, value: '' }, tiktok: { enabled: false, value: '' },
      github: { enabled: false, value: '' }, spotify: { enabled: false, value: '' },
      youtube: { enabled: false, value: '' }, steam: { enabled: false, value: '' },
      custom: []
    },
    features: {
      musicPlayer: { enabled: false, track: 'assets/music.mp3', title: 'track name' },
      typewriterBio: { enabled: true },
      customCursor: { enabled: true },
      particleBackground: { enabled: true },
      viewCounter: { enabled: true, namespace: 'systemlover-xyz-page' },
      pageLock: { enabled: false, passwordHash: '' }
    }
  };
}

/* ---------------- populate form ---------------- */
function populateForm(s) {
  document.getElementById('f-displayName').value = s.profile.displayName;
  document.getElementById('f-handle').value = s.profile.handle;
  document.getElementById('f-bio').value = s.profile.bio;
  document.getElementById('avatar-preview').src = resolveAssetUrl(s.profile.avatar);
  renderBadges();

  document.getElementById('f-accent').value = s.theme.accent;
  document.getElementById('f-accent2').value = s.theme.accent2;
  document.getElementById('f-bgType').value = s.theme.backgroundType;
  toggleBgMediaRow();
  document.getElementById('bg-media-current').textContent = s.theme.backgroundMedia
    ? 'current: ' + s.theme.backgroundMedia : 'no file set';
  document.getElementById('f-introAnim').value = s.theme.introAnimation;

  renderSocialPresets();
  renderCustomLinks();

  document.getElementById('f-typewriter').checked = s.features.typewriterBio.enabled;
  document.getElementById('f-cursor').checked = s.features.customCursor.enabled;
  document.getElementById('f-particles').checked = s.features.particleBackground.enabled;
  document.getElementById('f-viewcounter').checked = s.features.viewCounter.enabled;
  document.getElementById('f-music-enabled').checked = s.features.musicPlayer.enabled;
  document.getElementById('f-music-title').value = s.features.musicPlayer.title;
  document.getElementById('music-current').textContent = 'current: ' + s.features.musicPlayer.track;
  toggleMusicFields();

  document.getElementById('f-lock-enabled').checked = s.features.pageLock.enabled;
  document.getElementById('lock-status').textContent = s.features.pageLock.passwordHash
    ? 'a password is currently set.' : 'no password set yet.';
  toggleLockFields();
}

function resolveAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return RAW_BASE + path;
}

document.getElementById('f-bgType').addEventListener('change', toggleBgMediaRow);
function toggleBgMediaRow() {
  const type = document.getElementById('f-bgType').value;
  document.getElementById('bg-media-row').hidden = !(type === 'image' || type === 'video');
}
document.getElementById('f-music-enabled').addEventListener('change', toggleMusicFields);
function toggleMusicFields() {
  document.getElementById('music-fields').style.display =
    document.getElementById('f-music-enabled').checked ? 'block' : 'none';
}
document.getElementById('f-lock-enabled').addEventListener('change', toggleLockFields);
function toggleLockFields() {
  document.getElementById('lock-fields').style.display =
    document.getElementById('f-lock-enabled').checked ? 'block' : 'none';
}

document.getElementById('f-avatar-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  pendingFiles.avatar = file;
  document.getElementById('avatar-preview').src = URL.createObjectURL(file);
});
document.getElementById('f-bgMedia-file').addEventListener('change', (e) => {
  pendingFiles.backgroundMedia = e.target.files[0] || null;
});
document.getElementById('f-music-file').addEventListener('change', (e) => {
  pendingFiles.musicTrack = e.target.files[0] || null;
});

/* ---------------- badges ---------------- */
function renderBadges() {
  const wrap = document.getElementById('badges-list');
  wrap.innerHTML = '';
  state.profile.badges.forEach((b, i) => {
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.innerHTML = `
      <input type="text" class="badge-icon" placeholder="icon" style="max-width:60px" value="${escapeAttr(b.icon || '')}">
      <input type="text" class="badge-label" placeholder="label" value="${escapeAttr(b.label || '')}">
      <button type="button" class="remove-btn">✕</button>`;
    row.querySelector('.badge-icon').addEventListener('input', (e) => state.profile.badges[i].icon = e.target.value);
    row.querySelector('.badge-label').addEventListener('input', (e) => state.profile.badges[i].label = e.target.value);
    row.querySelector('.remove-btn').addEventListener('click', () => { state.profile.badges.splice(i, 1); renderBadges(); });
    wrap.appendChild(row);
  });
}
document.getElementById('btn-add-badge').addEventListener('click', () => {
  state.profile.badges.push({ icon: '⚡', label: 'new' });
  renderBadges();
});

/* ---------------- socials ---------------- */
function renderSocialPresets() {
  const wrap = document.getElementById('socials-presets');
  wrap.innerHTML = '';
  PRESET_PLATFORMS.forEach(p => {
    const s = state.socials[p];
    const row = document.createElement('div');
    row.className = 'social-row';
    row.innerHTML = `
      <input type="checkbox" ${s.enabled ? 'checked' : ''}>
      <span class="platform">${p}</span>
      <input type="text" placeholder="username / url" value="${escapeAttr(s.value)}">`;
    row.querySelector('input[type=checkbox]').addEventListener('change', (e) => state.socials[p].enabled = e.target.checked);
    row.querySelector('input[type=text]').addEventListener('input', (e) => state.socials[p].value = e.target.value);
    wrap.appendChild(row);
  });
}

function renderCustomLinks() {
  const wrap = document.getElementById('custom-list');
  wrap.innerHTML = '';
  state.socials.custom.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    const iconOptions = ICON_OPTIONS.map(o => `<option value="${o}" ${c.icon === o ? 'selected' : ''}>${o}</option>`).join('');
    row.innerHTML = `
      <input type="checkbox" ${c.enabled ? 'checked' : ''}>
      <input type="text" class="c-label" placeholder="label" value="${escapeAttr(c.label || '')}">
      <input type="text" class="c-url" placeholder="https://..." value="${escapeAttr(c.url || '')}">
      <select class="c-icon">${iconOptions}</select>
      <button type="button" class="remove-btn">✕</button>`;
    row.querySelector('input[type=checkbox]').addEventListener('change', (e) => state.socials.custom[i].enabled = e.target.checked);
    row.querySelector('.c-label').addEventListener('input', (e) => state.socials.custom[i].label = e.target.value);
    row.querySelector('.c-url').addEventListener('input', (e) => state.socials.custom[i].url = e.target.value);
    row.querySelector('.c-icon').addEventListener('change', (e) => state.socials.custom[i].icon = e.target.value);
    row.querySelector('.remove-btn').addEventListener('click', () => { state.socials.custom.splice(i, 1); renderCustomLinks(); });
    wrap.appendChild(row);
  });
}
document.getElementById('btn-add-custom').addEventListener('click', () => {
  state.socials.custom.push({ enabled: true, label: '', url: '', icon: 'link' });
  renderCustomLinks();
});

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/* ---------------- collect form -> state ---------------- */
function collectSimpleFields() {
  state.profile.displayName = document.getElementById('f-displayName').value;
  state.profile.handle = document.getElementById('f-handle').value;
  state.profile.bio = document.getElementById('f-bio').value;

  state.theme.accent = document.getElementById('f-accent').value;
  state.theme.accent2 = document.getElementById('f-accent2').value;
  state.theme.backgroundType = document.getElementById('f-bgType').value;
  state.theme.introAnimation = document.getElementById('f-introAnim').value;

  state.features.typewriterBio.enabled = document.getElementById('f-typewriter').checked;
  state.features.customCursor.enabled = document.getElementById('f-cursor').checked;
  state.features.particleBackground.enabled = document.getElementById('f-particles').checked;
  state.features.viewCounter.enabled = document.getElementById('f-viewcounter').checked;
  state.features.musicPlayer.enabled = document.getElementById('f-music-enabled').checked;
  state.features.musicPlayer.title = document.getElementById('f-music-title').value;

  state.features.pageLock.enabled = document.getElementById('f-lock-enabled').checked;
}

/* ---------------- GitHub Contents API ---------------- */
async function ghGetSha(path) {
  const res = await fetch(`${GH_API}/contents/${path}?ref=${GH_BRANCH}`, {
    headers: { Authorization: `token ${getToken()}` }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${path} failed: ${(await res.json()).message || res.status}`);
  return (await res.json()).sha;
}

async function ghPutFile(path, base64Content, message) {
  const sha = await ghGetSha(path);
  const body = { message, content: base64Content, branch: GH_BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(`${GH_API}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `token ${getToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`write ${path} failed: ${(await res.json()).message || res.status}`);
  return res.json();
}

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function extOf(file) {
  const parts = file.name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'bin';
}

/* ---------------- build config.js text ---------------- */
function buildConfigJsText(s) {
  const soc = (p) => `    ${p.padEnd(10)}: { enabled: ${s.socials[p].enabled}, value: ${JSON.stringify(s.socials[p].value)} },`;
  const badges = s.profile.badges.map(b => `      { icon: ${JSON.stringify(b.icon)}, label: ${JSON.stringify(b.label)} }`).join(',\n');
  const custom = s.socials.custom.map(c =>
    `      { enabled: ${c.enabled}, label: ${JSON.stringify(c.label)}, url: ${JSON.stringify(c.url)}, icon: ${JSON.stringify(c.icon)} }`
  ).join(',\n');

  return `/**
 * ============================================================
 *  EDIT THIS FILE TO CUSTOMIZE YOUR PAGE (or use /dev).
 *  Every "enabled" flag below is a toggle — flip it true/false.
 * ============================================================
 */
const CONFIG = {
  profile: {
    displayName: ${JSON.stringify(s.profile.displayName)},
    handle: ${JSON.stringify(s.profile.handle)},
    bio: ${JSON.stringify(s.profile.bio)},
    avatar: ${JSON.stringify(s.profile.avatar)},
    badges: [
${badges}
    ]
  },

  theme: {
    accent: ${JSON.stringify(s.theme.accent)},
    accent2: ${JSON.stringify(s.theme.accent2)},
    backgroundType: ${JSON.stringify(s.theme.backgroundType)},
    backgroundMedia: ${JSON.stringify(s.theme.backgroundMedia)},
    introAnimation: ${JSON.stringify(s.theme.introAnimation)}
  },

  socials: {
${PRESET_PLATFORMS.map(soc).join('\n')}

    custom: [
${custom}
    ]
  },

  features: {
    musicPlayer: { enabled: ${s.features.musicPlayer.enabled}, track: ${JSON.stringify(s.features.musicPlayer.track)}, title: ${JSON.stringify(s.features.musicPlayer.title)} },
    typewriterBio: { enabled: ${s.features.typewriterBio.enabled} },
    customCursor: { enabled: ${s.features.customCursor.enabled} },
    particleBackground: { enabled: ${s.features.particleBackground.enabled} },
    viewCounter: { enabled: ${s.features.viewCounter.enabled}, namespace: ${JSON.stringify(s.features.viewCounter.namespace)} },
    pageLock: { enabled: ${s.features.pageLock.enabled}, passwordHash: ${JSON.stringify(s.features.pageLock.passwordHash)} }
  }
};
`;
}

/* ---------------- keep social-embed meta tags in sync ---------------- */
function buildUpdatedIndexHtml(html, s) {
  const title = escapeHtmlText(s.profile.displayName || 'systemlover');
  const desc = escapeHtmlText(s.profile.bio || '');
  const imageUrl = s.profile.avatar.startsWith('http')
    ? s.profile.avatar
    : `https://systemlover.xyz/${s.profile.avatar}`;

  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${imageUrl}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${imageUrl}$2`)
    .replace(/(<meta name="theme-color" content=")[^"]*(")/, `$1${s.theme.accent}$2`);
}

function escapeHtmlText(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---------------- publish ---------------- */
document.getElementById('btn-publish').addEventListener('click', async () => {
  if (!getToken()) {
    setStatus('save a GitHub token above before publishing.', 'err');
    return;
  }
  const btn = document.getElementById('btn-publish');
  btn.disabled = true;
  const log = document.getElementById('publish-log');

  try {
    collectSimpleFields();

    const newPassword = document.getElementById('f-lock-password').value;
    if (newPassword) {
      state.features.pageLock.passwordHash = await sha256Hex(newPassword);
      document.getElementById('f-lock-password').value = '';
    }

    if (pendingFiles.avatar) {
      log.textContent = 'uploading avatar…';
      const ext = extOf(pendingFiles.avatar);
      const path = `assets/avatar.${ext}`;
      await ghPutFile(path, await fileToBase64(pendingFiles.avatar), 'dev: update avatar');
      state.profile.avatar = path;
    }
    if (pendingFiles.backgroundMedia) {
      log.textContent = 'uploading background media…';
      const ext = extOf(pendingFiles.backgroundMedia);
      const path = `assets/bg.${ext}`;
      await ghPutFile(path, await fileToBase64(pendingFiles.backgroundMedia), 'dev: update background media');
      state.theme.backgroundMedia = path;
    }
    if (pendingFiles.musicTrack) {
      log.textContent = 'uploading music track…';
      const ext = extOf(pendingFiles.musicTrack);
      const path = `assets/music.${ext}`;
      await ghPutFile(path, await fileToBase64(pendingFiles.musicTrack), 'dev: update music track');
      state.features.musicPlayer.track = path;
    }

    log.textContent = 'publishing config.js…';
    const text = buildConfigJsText(state);
    await ghPutFile('config.js', b64EncodeUnicode(text), 'dev: update profile config');

    log.textContent = 'syncing link preview…';
    const currentHtmlRes = await fetch(RAW_BASE + 'index.html?_=' + Date.now());
    const currentHtml = await currentHtmlRes.text();
    const updatedHtml = buildUpdatedIndexHtml(currentHtml, state);
    if (updatedHtml !== currentHtml) {
      await ghPutFile('index.html', b64EncodeUnicode(updatedHtml), 'dev: sync link preview');
    }

    pendingFiles = { avatar: null, backgroundMedia: null, musicTrack: null };
    document.getElementById('lock-status').textContent = state.features.pageLock.passwordHash
      ? 'a password is currently set.' : 'no password set yet.';
    setStatus('published. live site will update in under a minute.', 'ok');
    log.textContent = '';
  } catch (err) {
    setStatus(err.message, 'err');
    log.textContent = '';
  } finally {
    btn.disabled = false;
  }
});

function setStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status ' + type;
  el.hidden = false;
}
