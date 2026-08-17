document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-submit');
  const msg = document.getElementById('msg');
  msg.hidden = true;
  btn.disabled = true;

  const email = document.getElementById('f-email').value.trim();
  const password = document.getElementById('f-password').value;

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await ensureProfile(supabaseClient, data.user);
    location.href = '../account/';
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'msg err';
    msg.hidden = false;
    btn.disabled = false;
  }
});
