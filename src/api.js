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
  let users = [];
  source.onmessage = (event) => {
    try {
      const update = JSON.parse(event.data);
      if (Array.isArray(update)) {
        users = update;
      } else if (update.type === 'upsert' && update.user?.id) {
        users = [...users.filter((user) => user.id !== update.user.id), update.user];
      }
      onUsers(users);
    } catch (error) {
      onError(error);
    }
  };
  source.onerror = () => {
    onError(new Error('The live registered-users connection was interrupted; reconnecting.'));
  };
  return () => source.close();
};

export const observeUserProfile = (userId, onUser, onError) => {
  const source = new EventSource(`/api/users/${encodeURIComponent(userId)}/events`);
  source.onmessage = (event) => {
    try {
      const update = JSON.parse(event.data);
      if (Array.isArray(update)) {
        onUser(update[0] || null);
      } else if (update.type === 'upsert' && update.user?.id === userId) {
        onUser(update.user);
      }
    } catch (error) {
      onError(error);
    }
  };
  source.onerror = () => {
    onError(new Error('The live account connection was interrupted; reconnecting.'));
  };
  return () => source.close();
};

export const changeUserBalance = async (userId, changeInCents) => {
  const result = await post('/api/wallet/change', { userId, changeInCents });
  return result.user;
};
