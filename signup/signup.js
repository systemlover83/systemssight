const usernameInput = document.getElementById('f-username');
const usernameHint = document.getElementById('username-hint');
let usernameCheckTimer;

usernameInput.addEventListener('input', () => {
  const val = usernameInput.value.trim().toLowerCase();
  usernameInput.value = val;
  clearTimeout(usernameCheckTimer);

  if (!val) { usernameHint.textContent = ''; return; }
  if (!USERNAME_RE.test(val)) {
    usernameHint.textContent = 'lowercase letters, numbers, underscore only, 3-20 chars';
    usernameHint.style.color = 'var(--danger)';
    return;
  }
  usernameHint.textContent = 'checking availability…';
  usernameHint.style.color = '';
  usernameCheckTimer = setTimeout(async () => {
    const { data } = await supabaseClient.from('profiles').select('username').eq('username', val).maybeSingle();
    if (data) {
      usernameHint.textContent = 'that username is taken';
      usernameHint.style.color = 'var(--danger)';
    } else {
      usernameHint.textContent = 'available — systemlover.xyz/u/' + val;
      usernameHint.style.color = 'var(--ok)';
    }
  }, 400);
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-submit');
  const msg = document.getElementById('msg');
  msg.hidden = true;

  const username = usernameInput.value.trim().toLowerCase();
  const email = document.getElementById('f-email').value.trim();
  const password = document.getElementById('f-password').value;

  if (!USERNAME_RE.test(username)) {
    showMsg('username must be lowercase letters, numbers, underscore only, 3-20 chars', 'err');
    return;
  }

  btn.disabled = true;
  try {
    const { data: existing } = await supabaseClient.from('profiles').select('username').eq('username', username).maybeSingle();
    if (existing) throw new Error('that username is taken');

    const { data, error } = await supabaseClient.auth.signUp({
      email, password,
      options: { data: { username } }
    });
    if (error) throw error;

    if (data.session) {
      await ensureProfile(supabaseClient, data.user);
      location.href = '../account/';
    } else {
      showMsg('check your email to confirm your account, then log in.', 'ok');
    }
  } catch (err) {
    showMsg(err.message, 'err');
  } finally {
    btn.disabled = false;
  }
});

function showMsg(text, type) {
  const msg = document.getElementById('msg');
  msg.textContent = text;
  msg.className = 'msg ' + type;
  msg.hidden = false;
}
