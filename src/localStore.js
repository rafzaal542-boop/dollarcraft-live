const USERS_REFRESH_INTERVAL_MS = 2000;

const requestApi = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: 'same-origin',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers
      }
    });
  } catch (error) {
    throw new Error('Unable to reach the account service. Check your connection and try again.', {
      cause: error
    });
  }

  if (response.status === 204) return null;

  let responseText;
  try {
    responseText = await response.text();
  } catch (error) {
    throw new Error('Unable to read the account service response. Please try again.', {
      cause: error
    });
  }

  let body = null;
  if (responseText) {
    try {
      body = JSON.parse(responseText);
    } catch (error) {
      if (response.ok) {
        throw new Error('The account service returned an unreadable response. Please try again.', {
          cause: error
        });
      }
    }
  }

  if (!response.ok) {
    throw new Error(
      (typeof body?.error === 'string' && body.error) ||
      `Account service unavailable (HTTP ${response.status}). Please try again.`
    );
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('The account service returned an unreadable response. Please try again.');
  }
  return body;
};

export const getCurrentSession = () => requestApi('/api/auth/session');

export const createAccount = (email, password, profile) =>
  requestApi('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      firstName: profile.firstName,
      lastName: profile.lastName
    })
  });

export const signInWithPassword = (email, password) =>
  requestApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

export const logOutUser = () =>
  requestApi('/api/auth/logout', { method: 'POST' });

export const observeAllUserProfiles = (onUsers, onError) =>
  observeProfiles('/api/users', onUsers, onError);

export const observeUserProfile = (userId, onUser, onError) => {
  const refresh = async () => {
    const { user } = await requestApi('/api/auth/session');
    return user?.id === userId ? [user] : [];
  };
  return observeProfiles(refresh, (users) => onUser(users[0] || null), onError);
};

const observeProfiles = (source, onUsers, onError) => {
  let active = true;
  let refreshing = false;

  const refresh = async () => {
    if (!active || refreshing) return;
    refreshing = true;
    try {
      const result = typeof source === 'string'
        ? await requestApi(source)
        : await source();
      if (active) {
        onUsers(typeof source === 'string' ? result.users : result);
      }
    } catch (error) {
      if (active) onError(error);
    } finally {
      refreshing = false;
    }
  };

  const refreshWhenVisible = () => {
    if (!globalThis.document?.hidden) refresh();
  };
  const interval = globalThis.setInterval(refreshWhenVisible, USERS_REFRESH_INTERVAL_MS);
  globalThis.window?.addEventListener?.('focus', refreshWhenVisible);
  globalThis.document?.addEventListener?.('visibilitychange', refreshWhenVisible);
  refresh();

  return () => {
    active = false;
    globalThis.clearInterval(interval);
    globalThis.window?.removeEventListener?.('focus', refreshWhenVisible);
    globalThis.document?.removeEventListener?.('visibilitychange', refreshWhenVisible);
  };
};

export const changeUserBalance = async (userId, changeInCents) => {
  const result = await requestApi(`/api/users/${encodeURIComponent(userId)}/balance`, {
    method: 'POST',
    body: JSON.stringify({ changeInCents })
  });
  return result.user;
};
