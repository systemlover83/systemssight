/* Shared helpers used by signup/login/account/viewer pages. */

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

function defaultProfileConfig(username) {
  return {
    profile: {
      displayName: username,
      handle: '@' + username,
      bio: '',
      avatar: '/assets/avatar-placeholder.svg',
      badges: []
    },
    theme: {
      accent: '#a855f7',
      accent2: '#22d3ee',
      backgroundType: 'particles',
      backgroundMedia: '',
      introAnimation: 'fade'
    },
    socials: {
      discord: { enabled: false, value: '' },
      twitter: { enabled: false, value: '' },
      instagram: { enabled: false, value: '' },
      tiktok: { enabled: false, value: '' },
      github: { enabled: false, value: '' },
      spotify: { enabled: false, value: '' },
      youtube: { enabled: false, value: '' },
      steam: { enabled: false, value: '' },
      custom: []
    },
    features: {
      musicPlayer: { enabled: false, track: '', title: '' },
      typewriterBio: { enabled: true },
      customCursor: { enabled: true },
      particleBackground: { enabled: true },
      viewCounter: { enabled: false, namespace: 'user-' + username },
      pageLock: { enabled: false, passwordHash: '' },
      ipLogging: { enabled: false }
    }
  };
}

/**
 * Returns the caller's profile row, creating it on first authenticated
 * visit (covers both instant sign-in and "confirm email first" flows,
 * since the row can only be inserted once a session actually exists).
 */
async function ensureProfile(client, user) {
  const { data: existing } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (existing) return existing;

  const username = (user.user_metadata?.username || 'user' + user.id.slice(0, 8)).toLowerCase();
  const { data: created, error } = await client
    .from('profiles')
    .insert({ id: user.id, username, config: defaultProfileConfig(username) })
    .select('*')
    .single();

  if (error) throw error;
  return created;
}
