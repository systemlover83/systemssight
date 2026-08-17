/* ============================================================
   Shared rendering engine. Takes a CONFIG-shaped object (see
   config.js for the shape) and draws the whole page from it.
   Used by both the root page (script.js, local config.js) and
   the public per-user viewer (u/viewer.js, config from Supabase).
   ============================================================ */

const ICONS = {
  discord: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="8" width="16" height="11" rx="5.5"/><circle cx="6.5" cy="7" r="2.2"/><circle cx="17.5" cy="7" r="2.2"/><ellipse cx="9" cy="13.2" rx="1.3" ry="1.6" fill="var(--bg)"/><ellipse cx="15" cy="13.2" rx="1.3" ry="1.6" fill="var(--bg)"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1" fill="currentColor" stroke="none"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 3c.3 2.1 1.8 3.6 4 3.9v2.6c-1.4 0-2.8-.4-4-1.2v6.4a5.3 5.3 0 1 1-5.3-5.3c.3 0 .5 0 .8.1v2.7a2.6 2.6 0 1 0 1.9 2.5V3h2.6z"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2.9-.3 2-.4 3-.4s2.1.1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3z"/></svg>',
  spotify: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9" stroke-width="1.6"/><path d="M7 10.5c3-1 7-.6 9.5.9M7.5 13.5c2.5-.8 5.7-.5 7.8.7M8 16.3c2-.6 4.5-.4 6.2.6"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.3l5 2.7-5 2.7z" fill="currentColor" stroke="none"/></svg>',
  steam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="16" cy="7.6" r="3.6"/><circle cx="16" cy="7.6" r="1.15" fill="currentColor" stroke="none"/><path d="M12.9 10.5c-1.5 1.7-3 3.2-4.6 4.5" stroke-linecap="round"/><circle cx="7.7" cy="16.1" r="3.2"/><circle cx="9.5" cy="14.5" r="1.7" fill="currentColor" stroke="none"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 15l6-6"/><path d="M11 6.5l1-1a3.5 3.5 0 015 5l-1 1"/><path d="M13 17.5l-1 1a3.5 3.5 0 01-5-5l1-1"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 18a3 3 0 100-6 3 3 0 000 6zm10-14v11.5a3 3 0 11-2-2.83V6.7l-6 1.5v9.3a3 3 0 11-2-2.83V6l10-2.5V4z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  controller: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="8" width="19" height="9" rx="4.5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="15.5" cy="11.5" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="14" r="1" fill="currentColor" stroke="none"/></svg>'
};

const PRESET_SOCIAL_URL = {
  discord: (v) => (v.startsWith('http') ? v : `https://discord.gg/${v}`),
  twitter: (v) => (v.startsWith('http') ? v : `https://x.com/${v}`),
  instagram: (v) => (v.startsWith('http') ? v : `https://instagram.com/${v}`),
  tiktok: (v) => (v.startsWith('http') ? v : `https://tiktok.com/@${v}`),
  github: (v) => (v.startsWith('http') ? v : `https://github.com/${v}`),
  spotify: (v) => v,
  youtube: (v) => v,
  steam: (v) => v
};

function renderPage(CONFIG) {
  const content = document.getElementById('page-content');
  const lock = CONFIG.features.pageLock;

  const reveal = () => {
    if (content) content.hidden = false;
    applyIntroAnimation(CONFIG);
    applyTheme(CONFIG);
    renderProfile(CONFIG);
    renderSocials(CONFIG);
    initBackground(CONFIG);
    initMusicPlayer(CONFIG);
    initCustomCursor(CONFIG);
    initViewCounter(CONFIG);
    logVisit(CONFIG);
  };

  if (lock?.enabled && lock.passwordHash) {
    if (content) content.hidden = true;
    initPageLock(CONFIG, reveal);
  } else {
    reveal();
  }
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function initPageLock(CONFIG, onUnlock) {
  const gate = document.getElementById('lock-gate');
  if (!gate) { onUnlock(); return; }

  const sessionKey = 'unlocked:' + (CONFIG.profile.handle || CONFIG.profile.displayName || 'page');
  if (sessionStorage.getItem(sessionKey) === '1') {
    onUnlock();
    return;
  }

  gate.hidden = false;
  document.getElementById('lock-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = document.getElementById('lock-input').value;
    const hash = await sha256Hex(val);
    if (hash === CONFIG.features.pageLock.passwordHash) {
      sessionStorage.setItem(sessionKey, '1');
      gate.hidden = true;
      onUnlock();
    } else {
      document.getElementById('lock-error').hidden = false;
    }
  });
}

function applyTheme(CONFIG) {
  const r = document.documentElement.style;
  r.setProperty('--accent', CONFIG.theme.accent);
  r.setProperty('--accent2', CONFIG.theme.accent2);
}

const INTRO_ANIMATIONS = ['fade', 'slide-up', 'slide-down', 'zoom', 'flip', 'glitch', 'blur', 'wipe'];

function applyIntroAnimation(CONFIG) {
  const card = document.querySelector('.card');
  if (!card) return;
  const choice = INTRO_ANIMATIONS.includes(CONFIG.theme.introAnimation) ? CONFIG.theme.introAnimation : 'fade';
  INTRO_ANIMATIONS.forEach(a => card.classList.remove('intro-' + a));
  if (prefersReducedMotion()) return;
  // restart the animation even if the same class was already present
  void card.offsetWidth;
  card.classList.add('intro-' + choice);
}

function renderProfile(CONFIG) {
  document.getElementById('avatar').src = CONFIG.profile.avatar;
  document.getElementById('display-name').textContent = CONFIG.profile.displayName;
  document.getElementById('handle').textContent = CONFIG.profile.handle;

  const badgeWrap = document.getElementById('badges');
  (CONFIG.profile.badges || []).forEach(b => {
    const el = document.createElement('span');
    el.className = 'badge';
    el.textContent = `${b.icon || ''} ${b.label || ''}`.trim();
    badgeWrap.appendChild(el);
  });

  const bioEl = document.getElementById('bio');
  const text = CONFIG.profile.bio || '';
  if (CONFIG.features.typewriterBio?.enabled && !prefersReducedMotion()) {
    typewrite(bioEl, text);
  } else {
    bioEl.textContent = text;
  }
}

function typewrite(el, text, speed = 40) {
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor-blink';
  cursor.textContent = '​';
  let i = 0;
  const tick = () => {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      el.appendChild(cursor);
      i++;
      setTimeout(tick, speed);
    } else {
      cursor.remove();
    }
  };
  tick();
}

function renderSocials(CONFIG) {
  const wrap = document.getElementById('socials');
  const s = CONFIG.socials;

  Object.keys(PRESET_SOCIAL_URL).forEach(key => {
    const entry = s[key];
    if (entry && entry.enabled && entry.value) {
      wrap.appendChild(makeSocialBtn(ICONS[key], PRESET_SOCIAL_URL[key](entry.value), key));
    }
  });

  (s.custom || []).forEach(c => {
    if (c.enabled && c.url) {
      wrap.appendChild(makeSocialBtn(ICONS[c.icon] || ICONS.link, c.url, c.label || 'link'));
    }
  });
}

function makeSocialBtn(iconSvg, url, label) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.className = 'social-btn';
  a.title = label;
  a.setAttribute('aria-label', label);
  a.innerHTML = iconSvg;
  return a;
}

/* ---------------- background ---------------- */
function initBackground(CONFIG) {
  const type = CONFIG.theme.backgroundType;
  const canvas = document.getElementById('bg-canvas');
  const video = document.getElementById('bg-video');
  const image = document.getElementById('bg-image');

  if (type === 'video' && CONFIG.theme.backgroundMedia) {
    video.src = CONFIG.theme.backgroundMedia;
    video.style.display = 'block';
  } else if (type === 'image' && CONFIG.theme.backgroundMedia) {
    image.style.backgroundImage = `url("${CONFIG.theme.backgroundMedia}")`;
    image.style.display = 'block';
  } else if (type === 'particles' && CONFIG.features.particleBackground?.enabled) {
    canvas.style.display = 'block';
    startParticles(canvas, CONFIG);
  }
  // "solid" -> nothing extra, just var(--bg)
}

function startParticles(canvas, CONFIG) {
  const ctx = canvas.getContext('2d');
  let w, h, particles;
  const reduced = prefersReducedMotion();

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const count = Math.min(90, Math.floor((w * h) / 16000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.6 + 0.6
  }));

  const c1 = CONFIG.theme.accent, c2 = CONFIG.theme.accent2;

  function frame() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = c2;
      ctx.globalAlpha = 0.7;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.strokeStyle = c1;
          ctx.globalAlpha = (1 - dist / 120) * 0.15;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    if (!reduced) requestAnimationFrame(frame);
  }
  frame();
}

/* ---------------- music player ---------------- */
function initMusicPlayer(CONFIG) {
  const cfg = CONFIG.features.musicPlayer;
  if (!cfg?.enabled || !cfg.track) return;

  const btn = document.getElementById('music-toggle');
  const audio = document.getElementById('music-audio');
  const playIcon = document.getElementById('music-icon-play');
  const pauseIcon = document.getElementById('music-icon-pause');

  audio.src = cfg.track;
  btn.hidden = false;
  btn.title = cfg.title || 'music';

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      playIcon.hidden = true;
      pauseIcon.hidden = false;
    } else {
      audio.pause();
      playIcon.hidden = false;
      pauseIcon.hidden = true;
    }
  });
}

/* ---------------- custom cursor ---------------- */
function initCustomCursor(CONFIG) {
  if (!CONFIG.features.customCursor?.enabled) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.body.classList.add('custom-cursor');
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  let mx = -100, my = -100;
  let rx = mx, ry = my;

  const reduced = prefersReducedMotion();
  let lastSpark = 0;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = `${mx}px`;
    dot.style.top = `${my}px`;
    const el = document.elementFromPoint(mx, my);
    ring.classList.toggle('hover', !!(el && el.closest('a,button,.social-btn')));

    if (!reduced && e.timeStamp - lastSpark > 45) {
      lastSpark = e.timeStamp;
      spawnCursorSpark(mx, my);
    }
  });

  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;
    requestAnimationFrame(loop);
  }
  loop();
}

function spawnCursorSpark(x, y) {
  const spark = document.createElement('div');
  spark.className = 'cursor-spark';
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  document.body.appendChild(spark);
  spark.addEventListener('animationend', () => spark.remove());
}

/* ---------------- view counter ---------------- */
async function initViewCounter(CONFIG) {
  const cfg = CONFIG.features.viewCounter;
  if (!cfg?.enabled) return;

  const wrap = document.getElementById('view-counter');
  const countEl = document.getElementById('view-count');
  wrap.hidden = false;

  const viewedKey = `viewed:${cfg.namespace}`;
  const alreadyCounted = localStorage.getItem(viewedKey);

  try {
    let count;
    if (alreadyCounted) {
      const { data, error } = await supabaseClient
        .from('page_views')
        .select('count')
        .eq('namespace', cfg.namespace)
        .maybeSingle();
      if (error) throw error;
      count = data?.count ?? 0;
    } else {
      const { data, error } = await supabaseClient.rpc('increment_view', { ns: cfg.namespace });
      if (error) throw error;
      count = data;
      localStorage.setItem(viewedKey, '1');
    }
    countEl.textContent = Number(count).toLocaleString();
  } catch (err) {
    const key = `viewcount:${cfg.namespace}`;
    const local = (parseInt(localStorage.getItem(key) || '0', 10) || 0) + 1;
    localStorage.setItem(key, local);
    countEl.textContent = `${local.toLocaleString()} (local)`;
  }
}

/* ---------------- visitor logging ---------------- */
async function logVisit(CONFIG) {
  if (!CONFIG.features.ipLogging?.enabled) return;
  if (typeof supabaseClient === 'undefined') return;
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const { ip } = await res.json();
    await supabaseClient.from('visitor_logs').insert({
      ip, user_agent: navigator.userAgent, page: location.pathname
    });
  } catch (err) {
    // never let logging break the page
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
