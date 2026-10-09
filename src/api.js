const getResponseError = (payload, response, responseText) => {
  if (payload && typeof payload === 'object' && typeof payload.error === 'string') {
    return payload.error;
  }

  const contentType = response.headers.get('content-type') || '';
  const bodyPreview = responseText.trim();
  if (bodyPreview && !/html/i.test(contentType) && !/^<!doctype html|^<html/i.test(bodyPreview)) {
    return bodyPreview.slice(0, 300);
  }

  return `The server returned an unexpected response (HTTP ${response.status}).`;
};

export const parseApiResponse = async (response) => {
  const responseText = await response.text();
  let payload = null;
  let validJson = false;

  if (responseText.trim()) {
    try {
      payload = JSON.parse(responseText);
      validJson = true;
    } catch {
      validJson = false;
    }
  }

  if (!response.ok) {
    throw new Error(getResponseError(payload, response, responseText));
  }

  if (!validJson) {
    throw new Error(
      responseText.trim()
        ? 'The server returned an invalid response. Please try again.'
        : 'The server returned an empty response. Please try again.'
    );
  }

  return payload;
};

const request = async (endpoint, options = {}) => {
  const response = await fetch(endpoint, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });
  return parseApiResponse(response);
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
