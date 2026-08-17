(async function () {
  const params = new URLSearchParams(location.search);
  let username = params.get('name');

  if (!username) {
    const m = location.pathname.match(/\/u\/([a-z0-9_]+)\/?$/i);
    if (m) username = m[1];
  }
  username = (username || '').toLowerCase();

  if (!username || !/^[a-z0-9_]{3,20}$/.test(username)) {
    showNotFound();
    return;
  }

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('config')
    .eq('username', username)
    .maybeSingle();

  if (error || !data) {
    showNotFound();
    return;
  }

  document.title = data.config.profile?.displayName || username;
  renderPage(data.config);
})();

function showNotFound() {
  document.getElementById('not-found').hidden = false;
}
