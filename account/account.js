const ICON_OPTIONS = ['link', 'music', 'play', 'controller'];
const PRESET_PLATFORMS = ['discord', 'twitter', 'instagram', 'tiktok', 'github', 'spotify', 'youtube', 'steam'];

let user = null;
let profileRow = null;
let state = null;
let pendingFiles = { avatar: null, backgroundMedia: null, musicTrack: null };

(async function init() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) { location.href = '../login/'; return; }
  user = session.user;

  try {
    profileRow = await ensureProfile(supabaseClient, user);
    state = { ...defaultProfileConfig(profileRow.username), ...profileRow.config };
    // deep-merge the nested objects so any fields missing from a stored config still get defaults
    state = mergeDeep(defaultProfileConfig(profileRow.username), profileRow.config);
  } catch (err) {
    document.getElementById('loading').innerHTML = `<p class="msg err">could not load your profile: ${err.message}</p>`;
    return;
  }

  document.getElementById('page-link').textContent = location.origin + '/u/' + profileRow.username;
  document.getElementById('page-link').href = '/u/' + profileRow.username;

  populateForm(state);
  document.getElementById('loading').hidden = true;
  document.getElementById('editor').hidden = false;
})();

function mergeDeep(base, override) {
  if (!override) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key in override) {
    if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key]) && base[key]) {
      out[key] = mergeDeep(base[key], override[key]);
    } else {
      out[key] = override[key];
    }
  }
  return out;
}

document.getElementById('btn-logout').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  location.href = '../login/';
});

/* ---------------- populate form ---------------- */
function populateForm(s) {
  document.getElementById('f-displayName').value = s.profile.displayName;
  document.getElementById('f-handle').value = s.profile.handle;
  document.getElementById('f-bio').value = s.profile.bio;
  document.getElementById('avatar-preview').src = s.profile.avatar;
  renderBadges();

  document.getElementById('f-accent').value = s.theme.accent;
  document.getElementById('f-accent2').value = s.theme.accent2;
  document.getElementById('f-bgType').value = s.theme.backgroundType;
  toggleBgMediaRow();
  document.getElementById('bg-media-current').textContent = s.theme.backgroundMedia
    ? 'current: ' + s.theme.backgroundMedia : 'no file set';

  renderSocialPresets();
  renderCustomLinks();

  document.getElementById('f-typewriter').checked = s.features.typewriterBio.enabled;
  document.getElementById('f-cursor').checked = s.features.customCursor.enabled;
  document.getElementById('f-particles').checked = s.features.particleBackground.enabled;
  document.getElementById('f-viewcounter').checked = s.features.viewCounter.enabled;
  document.getElementById('f-music-enabled').checked = s.features.musicPlayer.enabled;
  document.getElementById('f-music-title').value = s.features.musicPlayer.title;
  document.getElementById('music-current').textContent = 'current: ' + (s.features.musicPlayer.track || 'none');
  toggleMusicFields();
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

  state.features.typewriterBio.enabled = document.getElementById('f-typewriter').checked;
  state.features.customCursor.enabled = document.getElementById('f-cursor').checked;
  state.features.particleBackground.enabled = document.getElementById('f-particles').checked;
  state.features.viewCounter.enabled = document.getElementById('f-viewcounter').checked;
  state.features.musicPlayer.enabled = document.getElementById('f-music-enabled').checked;
  state.features.musicPlayer.title = document.getElementById('f-music-title').value;
}

function extOf(file) {
  const parts = file.name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'bin';
}

async function uploadAsset(file, name) {
  const path = `${user.id}/${name}.${extOf(file)}`;
  const { error } = await supabaseClient.storage.from('user-assets').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabaseClient.storage.from('user-assets').getPublicUrl(path);
  return data.publicUrl;
}

/* ---------------- save ---------------- */
document.getElementById('btn-save').addEventListener('click', async () => {
  const btn = document.getElementById('btn-save');
  const log = document.getElementById('save-log');
  btn.disabled = true;

  try {
    collectSimpleFields();

    if (pendingFiles.avatar) {
      log.textContent = 'uploading avatar…';
      state.profile.avatar = await uploadAsset(pendingFiles.avatar, 'avatar');
    }
    if (pendingFiles.backgroundMedia) {
      log.textContent = 'uploading background media…';
      state.theme.backgroundMedia = await uploadAsset(pendingFiles.backgroundMedia, 'bg');
    }
    if (pendingFiles.musicTrack) {
      log.textContent = 'uploading music track…';
      state.features.musicPlayer.track = await uploadAsset(pendingFiles.musicTrack, 'music');
    }

    log.textContent = 'saving…';
    const { error } = await supabaseClient.from('profiles').update({ config: state }).eq('id', user.id);
    if (error) throw error;

    pendingFiles = { avatar: null, backgroundMedia: null, musicTrack: null };
    setStatus('saved.', 'ok');
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
