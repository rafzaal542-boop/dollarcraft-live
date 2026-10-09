const request = async (endpoint, options = {}) => {
  const response = await fetch(endpoint, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'The request could not be completed.');
  }
  return result;
};

const post = (endpoint, body = {}) =>
  request(endpoint, { method: 'POST', body: JSON.stringify(body) });

export const getCurrentSession = async () => {
  try {
    return await request('/api/me');
  } catch (error) {
    if (error.message === 'Please sign in.' || error.message === 'This account no longer exists.') {
      return null;
    }
    throw error;
  }
};

export const createAccount = (email, password, profile) =>
  post('/api/auth/register', { email, password, ...profile });

export const signInWithPassword = (email, password) =>
  post('/api/auth/login', { email, password });

export const logOutUser = () => post('/api/auth/logout');

export const observeAllUserProfiles = (onUsers, onError) => {
  const source = new EventSource('/api/users/events');
  source.onmessage = (event) => {
    try {
      onUsers(JSON.parse(event.data));
    } catch (error) {
      onError(error);
    }
  };
  source.onerror = () => {
    source.close();
    onError(new Error('The live registered-users connection was interrupted.'));
  };
  return () => source.close();
};

export const observeUserProfile = (userId, onUser, onError) => {
  const source = new EventSource(`/api/users/${encodeURIComponent(userId)}/events`);
  source.onmessage = (event) => {
    try {
      const users = JSON.parse(event.data);
      onUser(users[0] || null);
    } catch (error) {
      onError(error);
    }
  };
  source.onerror = () => {
    source.close();
    onError(new Error('The live account connection was interrupted.'));
  };
  return () => source.close();
};

export const changeUserBalance = async (userId, changeInCents) => {
  const result = await post('/api/wallet/change', { userId, changeInCents });
  return result.user;
};
