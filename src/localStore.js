const REFRESH_INTERVAL_MS = 5000;
const LOCAL_ACCOUNTS_KEY = 'dollarcraft.localAccounts.v1';
const LOCAL_SESSION_KEY = 'dollarcraft.localSession.v1';
const LOCAL_USERS_EVENT = 'dollarcraft:local-users-changed';

class ApiUnavailableError extends Error {}

const request = async (path, options = {}) => {
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
  } catch {
    throw new ApiUnavailableError('The account service is unavailable.');
  }

  if (response.status === 204) return null;

  const responseText = await response.text();
  let result = null;
  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new ApiUnavailableError('The account service returned an unexpected response.');
    }
  } else if (response.ok) {
    throw new ApiUnavailableError('The account service returned an empty response.');
  } else if (response.status === 404 || response.status >= 500) {
    throw new ApiUnavailableError('The account service is unavailable.');
  }

  if (!response.ok) {
    if (response.status === 404 || response.status >= 500) {
      throw new ApiUnavailableError('The account service is unavailable.');
    }
    throw new Error(result?.error || 'The account service could not complete the request.');
  }
  return result;
};

const post = (path, body) =>
  request(path, { method: 'POST', body: JSON.stringify(body) });

const getLocalStorage = () => {
  if (!globalThis.localStorage) {
    throw new Error('Browser storage is unavailable; this account cannot be saved locally.');
  }
  return globalThis.localStorage;
};

const readLocalAccounts = () => {
  const serializedAccounts = getLocalStorage().getItem(LOCAL_ACCOUNTS_KEY);
  if (!serializedAccounts) return [];

  let accounts;
  try {
    accounts = JSON.parse(serializedAccounts);
  } catch {
    throw new Error("Saved local accounts could not be read. Clear this site's saved account data and try again.");
  }
  if (
    !Array.isArray(accounts) ||
    accounts.some((account) =>
      !account ||
      typeof account.id !== 'string' ||
      typeof account.email !== 'string' ||
      typeof account.passwordSalt !== 'string' ||
      typeof account.passwordHash !== 'string'
    )
  ) {
    throw new Error("Saved local account data is invalid. Clear this site's saved account data and try again.");
  }
  return accounts;
};

const getCrypto = () => {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle || !cryptoApi.getRandomValues) {
    throw new Error('Secure browser storage is unavailable in this browser.');
  }
  return cryptoApi;
};

const createPasswordHash = async (password, salt) => {
  const cryptoApi = getCrypto();
  const key = await cryptoApi.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const hash = await cryptoApi.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: 120000,
    hash: 'SHA-256'
  }, key, 256);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
};

const createRandomHex = (byteLength) => {
  const bytes = getCrypto().getRandomValues(new Uint8Array(byteLength));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const profileFromLocalAccount = (account) => ({
  id: account.id,
  firstName: account.firstName,
  lastName: account.lastName,
  name: `${account.firstName} ${account.lastName}`.trim(),
  email: account.email,
  createdAt: account.createdAt,
  balanceCents: account.balanceCents
});

const localAuthResult = (account) => ({
  user: profileFromLocalAccount(account),
  isAdmin: false,
  isLocal: true
});

const publishLocalUsersChanged = () => {
  if (
    typeof globalThis.window?.dispatchEvent === 'function' &&
    typeof globalThis.Event === 'function'
  ) {
    globalThis.window.dispatchEvent(new Event(LOCAL_USERS_EVENT));
  }
};

const saveLocalAccounts = (accounts) => {
  getLocalStorage().setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  publishLocalUsersChanged();
};

const createLocalAccount = async (email, password, profile) => {
  const normalizedEmail = email.trim().toLowerCase();
  const firstName = profile.firstName.trim();
  const lastName = profile.lastName.trim();
  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
    !firstName ||
    firstName.length > 100 ||
    !lastName ||
    lastName.length > 100 ||
    password.length < 12 ||
    password.length > 128 ||
    new TextEncoder().encode(password).length > 512
  ) {
    throw new Error('Enter valid names and email, and a password of 12 to 128 characters.');
  }

  const accounts = readLocalAccounts();
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const salt = createRandomHex(16);
  const account = {
    id: `local-${createRandomHex(16)}`,
    firstName,
    lastName,
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
    balanceCents: 0,
    passwordSalt: salt,
    passwordHash: await createPasswordHash(password, new TextEncoder().encode(salt))
  };
  saveLocalAccounts([...accounts, account]);
  getLocalStorage().setItem(LOCAL_SESSION_KEY, account.id);
  return localAuthResult(account);
};

const signInLocalAccount = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  const account = readLocalAccounts().find((item) => item.email === normalizedEmail);
  if (!account) throw new Error('Incorrect email or password.');

  const candidateHash = await createPasswordHash(
    password,
    new TextEncoder().encode(account.passwordSalt)
  );
  if (candidateHash !== account.passwordHash) {
    throw new Error('Incorrect email or password.');
  }

  getLocalStorage().setItem(LOCAL_SESSION_KEY, account.id);
  return localAuthResult(account);
};

const getLocalSession = () => {
  if (!globalThis.localStorage) {
    return { user: null, isAdmin: false, isLocal: true };
  }
  const userId = getLocalStorage().getItem(LOCAL_SESSION_KEY);
  if (!userId) return { user: null, isAdmin: false, isLocal: true };
  const account = readLocalAccounts().find((item) => item.id === userId);
  if (!account) {
    getLocalStorage().removeItem(LOCAL_SESSION_KEY);
    return { user: null, isAdmin: false, isLocal: true };
  }
  return localAuthResult(account);
};

const getLocalProfiles = () =>
  globalThis.localStorage
    ? readLocalAccounts().map(profileFromLocalAccount)
    : [];

const mergeProfiles = (localProfiles, remoteProfiles) => {
  const profilesByEmail = new Map(
    localProfiles.map((profile) => [profile.email.toLowerCase(), profile])
  );
  remoteProfiles.forEach((profile) => {
    profilesByEmail.set(profile.email.toLowerCase(), profile);
  });
  return [...profilesByEmail.values()];
};

export const getCurrentSession = async () => {
  try {
    const result = await request('/api/auth/session');
    if (result?.user) return result;
    return getLocalSession();
  } catch (error) {
    if (!(error instanceof ApiUnavailableError)) throw error;
    return getLocalSession();
  }
};

export const createAccount = (email, password, profile) =>
  post('/api/auth/register', {
    email,
    password,
    firstName: profile.firstName,
    lastName: profile.lastName
  }).catch((error) => {
    if (!(error instanceof ApiUnavailableError)) throw error;
    return createLocalAccount(email, password, profile);
  });

export const signInWithPassword = (email, password) =>
  post('/api/auth/login', { email, password }).catch((error) => {
    if (!(error instanceof ApiUnavailableError)) throw error;
    return signInLocalAccount(email, password);
  });

export const logOutUser = async () => {
  try {
    await post('/api/auth/logout', {});
  } catch (error) {
    if (!(error instanceof ApiUnavailableError)) throw error;
  } finally {
    globalThis.localStorage?.removeItem(LOCAL_SESSION_KEY);
  }
};

export const observeAllUserProfiles = (onUsers, onError) => {
  let active = true;
  let requestInProgress = false;
  let remoteUsers = [];

  const publishProfiles = () => {
    if (active) onUsers(mergeProfiles(getLocalProfiles(), remoteUsers));
  };

  const refresh = async () => {
    if (!active || requestInProgress) return;
    requestInProgress = true;
    try {
      const result = await request('/api/users');
      remoteUsers = result.users;
      publishProfiles();
    } catch (error) {
      if (error instanceof ApiUnavailableError) {
        try {
          publishProfiles();
        } catch (storageError) {
          if (active) onError(storageError);
        }
      } else if (active) {
        onError(error);
      }
    } finally {
      requestInProgress = false;
    }
  };

  void refresh();
  const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS);
  const onLocalUsersChanged = () => {
    try {
      publishProfiles();
    } catch (error) {
      if (active) onError(error);
    }
  };
  const onStorage = (event) => {
    if (event.key === LOCAL_ACCOUNTS_KEY) onLocalUsersChanged();
  };
  window.addEventListener?.(LOCAL_USERS_EVENT, onLocalUsersChanged);
  window.addEventListener?.('storage', onStorage);
  return () => {
    active = false;
    window.clearInterval(intervalId);
    window.removeEventListener?.(LOCAL_USERS_EVENT, onLocalUsersChanged);
    window.removeEventListener?.('storage', onStorage);
  };
};

export const observeUserProfile = (userId, onUser, onError) => {
  let active = true;
  let requestInProgress = false;

  const refresh = async () => {
    if (!active || requestInProgress) return;
    requestInProgress = true;
    try {
      try {
        const result = await request('/api/auth/session');
        if (active) {
          onUser(result.user
            ? result.user.id === userId ? result.user : null
            : getLocalSession().user);
        }
      } catch (error) {
        if (!(error instanceof ApiUnavailableError)) throw error;
        const localResult = getLocalSession();
        if (active) onUser(localResult.user?.id === userId ? localResult.user : null);
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
