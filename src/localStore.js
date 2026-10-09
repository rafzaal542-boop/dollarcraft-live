const REFRESH_INTERVAL_MS = 5000;

const request = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });
  const result = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(result?.error || 'The account service could not complete the request.');
  }
  return result;
};

const post = (path, body) =>
  request(path, { method: 'POST', body: JSON.stringify(body) });

export const getCurrentSession = () => request('/api/auth/session');

export const createAccount = (email, password, profile) =>
  post('/api/auth/register', {
    email,
    password,
    firstName: profile.firstName,
    lastName: profile.lastName
  });

export const signInWithPassword = (email, password) =>
  post('/api/auth/login', { email, password });

export const logOutUser = () => post('/api/auth/logout', {});

export const observeAllUserProfiles = (onUsers, onError) => {
  let active = true;
  let requestInProgress = false;

  const refresh = async () => {
    if (!active || requestInProgress) return;
    requestInProgress = true;
    try {
      const result = await request('/api/users');
      if (active) onUsers(result.users);
    } catch (error) {
      if (active) onError(error);
    } finally {
      requestInProgress = false;
    }
  };

  void refresh();
  const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS);
  return () => {
    active = false;
    window.clearInterval(intervalId);
  };
};

export const observeUserProfile = (userId, onUser, onError) => {
  let active = true;
  let requestInProgress = false;

  const refresh = async () => {
    if (!active || requestInProgress) return;
    requestInProgress = true;
    try {
      const result = await getCurrentSession();
      if (active) {
        onUser(result.user?.id === userId ? result.user : null);
      }
    } catch (error) {
      if (active) onError(error);
    } finally {
      requestInProgress = false;
    }
  };

  void refresh();
  const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS);
  return () => {
    active = false;
    window.clearInterval(intervalId);
  };
};

export const changeUserBalance = async (userId, changeInCents) => {
  const result = await post(`/api/users/${encodeURIComponent(userId)}/balance`, {
    changeInCents
  });
  return result.user;
};
