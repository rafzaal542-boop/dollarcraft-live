const USERS_REFRESH_INTERVAL_MS = 2000;
const LOCAL_ACCOUNTS_KEY = 'dollarcraft_global_users';
const LOCAL_SESSION_KEY = 'dollarcraft.localSession.v1';
const LOCAL_USERS_EVENT = 'dollarcraft:local-users-changed';
const ADMIN_EMAIL = 'dollarcraft3@gmail.com';

class AccountServiceError extends Error {
  constructor(message, { status = null, cause } = {}) {
    super(message, { cause });
    this.name = 'AccountServiceError';
    this.status = status;
  }
}

const shouldUseLocalFallback = (error) =>
  error instanceof AccountServiceError &&
  (error.status === null || error.status === 404);

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
    throw new AccountServiceError(
      'Unable to reach the account service. Check your connection and try again.',
      { cause: error }
    );
  }

  if (response.status === 204) return null;

  let responseText;
  try {
    responseText = await response.text();
  } catch (error) {
    throw new AccountServiceError(
      'Unable to read the account service response. Please try again.',
      { status: response.status, cause: error }
    );
  }

  let body = null;
  if (responseText) {
    try {
      body = JSON.parse(responseText);
    } catch (error) {
      if (response.ok) {
        throw new AccountServiceError(
          'The account service returned an unreadable response. Please try again.',
          { status: response.status, cause: error }
        );
      }
    }
  }

  if (!response.ok) {
    throw new AccountServiceError(
      (typeof body?.error === 'string' && body.error) ||
      `Account service unavailable (HTTP ${response.status}). Please try again.`,
      { status: response.status }
    );
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AccountServiceError(
      'The account service returned an unreadable response. Please try again.',
      { status: response.status }
    );
  }
  return body;
};

const getStorage = () => {
  if (!globalThis.localStorage) {
    throw new Error('Browser storage is unavailable; offline sign-in is not possible.');
  }
  return globalThis.localStorage;
};

const getLocalAccounts = () => {
  const serialized = getStorage().getItem(LOCAL_ACCOUNTS_KEY);
  if (!serialized) return [];
  let accounts;
  try {
    accounts = JSON.parse(serialized);
  } catch (cause) {
    throw new Error('Saved offline accounts are unreadable. Clear this site’s saved data.', { cause });
  }
  if (!Array.isArray(accounts) || accounts.some((account) =>
    !account ||
    typeof account.id !== 'string' ||
    typeof account.email !== 'string' ||
    typeof account.passwordSalt !== 'string' ||
    typeof account.passwordHash !== 'string'
  )) {
    throw new Error('Saved offline account data is invalid. Clear this site’s saved data.');
  }
  return accounts;
};

const saveLocalAccounts = (accounts) => {
  getStorage().setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  if (typeof globalThis.window?.dispatchEvent === 'function' &&
    typeof globalThis.Event === 'function') {
    globalThis.window.dispatchEvent(new Event(LOCAL_USERS_EVENT));
  }
};

const deriveLocalPasswordHash = async (password, salt) => {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle || !cryptoApi.getRandomValues) {
    throw new Error('Secure offline sign-in is unavailable in this browser.');
  }
  const key = await cryptoApi.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const result = await cryptoApi.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: 120000,
    hash: 'SHA-256'
  }, key, 256);
  return Array.from(new Uint8Array(result), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
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
  user: { ...profileFromLocalAccount(account), role: 'user' },
  isAdmin: false,
  isLocal: true
});

const createLocalAccount = async (email, password, profile) => {
  const normalizedEmail = email.trim().toLowerCase();
  const firstName = profile.firstName.trim();
  const lastName = profile.lastName.trim();
  if (normalizedEmail === ADMIN_EMAIL) {
    throw new Error('Administrator sign-in requires the account service.');
  }
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
    normalizedEmail.length > 254 ||
    !firstName || firstName.length > 100 ||
    !lastName || lastName.length > 100 ||
    password.length < 1 || password.length > 128 ||
    new TextEncoder().encode(password).length > 512
  ) {
    throw new Error('Enter valid names and email, and a password of 1 to 128 characters.');
  }
  const accounts = getLocalAccounts();
  if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error('Secure offline registration is unavailable in this browser.');
  }
  const salt = cryptoApi.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt, (byte) => byte.toString(16).padStart(2, '0')).join('');
  const account = {
    id: `local-${saltHex}`,
    firstName,
    lastName,
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
    balanceCents: 0,
    passwordSalt: saltHex,
    passwordHash: await deriveLocalPasswordHash(password, salt)
  };
  saveLocalAccounts([...accounts, account]);
  getStorage().setItem(LOCAL_SESSION_KEY, account.id);
  return localAuthResult(account);
};

const signInLocalAccount = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === ADMIN_EMAIL) {
    throw new Error('Administrator sign-in requires the account service.');
  }
  const account = getLocalAccounts().find(
    (item) => item.email.toLowerCase() === normalizedEmail
  );
  if (!account) throw new Error('Incorrect email or password.');
  const salt = Uint8Array.from(
    account.passwordSalt.match(/.{2}/g) || [],
    (byte) => Number.parseInt(byte, 16)
  );
  const passwordHash = await deriveLocalPasswordHash(password, salt);
  if (passwordHash !== account.passwordHash) {
    throw new Error('Incorrect email or password.');
  }
  getStorage().setItem(LOCAL_SESSION_KEY, account.id);
  return localAuthResult(account);
};

const getLocalSession = () => {
  if (!globalThis.localStorage) return { user: null, isAdmin: false, isLocal: true };
  const userId = getStorage().getItem(LOCAL_SESSION_KEY);
  if (!userId) return { user: null, isAdmin: false, isLocal: true };
  const account = getLocalAccounts().find((item) => item.id === userId);
  if (!account) {
    getStorage().removeItem(LOCAL_SESSION_KEY);
    return { user: null, isAdmin: false, isLocal: true };
  }
  return localAuthResult(account);
};

export const getCurrentSession = async () => {
  try {
    const result = await requestApi('/api/auth/session');
    if (result.user) return result;
    const localSession = getLocalSession();
    return localSession.user ? localSession : result;
  } catch (error) {
    if (shouldUseLocalFallback(error)) return getLocalSession();
    throw error;
  }
};

export const createAccount = (email, password, profile) =>
  requestApi('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      firstName: profile.firstName,
      lastName: profile.lastName
    })
  }).catch((error) => {
    if (shouldUseLocalFallback(error)) return createLocalAccount(email, password, profile);
    throw error;
  });

export const signInWithPassword = (email, password) =>
  requestApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }).catch((error) => {
    if (shouldUseLocalFallback(error)) return signInLocalAccount(email, password);
    throw error;
  });

export const logOutUser = async () => {
  try {
    await requestApi('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
  } finally {
    globalThis.localStorage?.removeItem(LOCAL_SESSION_KEY);
  }
};

export const observeAllUserProfiles = (onUsers, onError) =>
  observeProfiles('/api/users', onUsers, onError);

export const observeUserProfile = (userId, onUser, onError) => {
  const refresh = async () => {
    if (userId.startsWith('local-')) {
      const account = getLocalAccounts().find((item) => item.id === userId);
      return account ? [profileFromLocalAccount(account)] : [];
    }
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
  const refreshOnStorageChange = (event) => {
    if (event.key === LOCAL_ACCOUNTS_KEY || event.key === LOCAL_SESSION_KEY || event.key === null) {
      refreshWhenVisible();
    }
  };
  const interval = globalThis.setInterval(refreshWhenVisible, USERS_REFRESH_INTERVAL_MS);
  globalThis.window?.addEventListener?.('focus', refreshWhenVisible);
  globalThis.window?.addEventListener?.(LOCAL_USERS_EVENT, refreshWhenVisible);
  globalThis.window?.addEventListener?.('storage', refreshOnStorageChange);
  globalThis.document?.addEventListener?.('visibilitychange', refreshWhenVisible);
  refresh();

  return () => {
    active = false;
    globalThis.clearInterval(interval);
    globalThis.window?.removeEventListener?.('focus', refreshWhenVisible);
    globalThis.window?.removeEventListener?.(LOCAL_USERS_EVENT, refreshWhenVisible);
    globalThis.window?.removeEventListener?.('storage', refreshOnStorageChange);
    globalThis.document?.removeEventListener?.('visibilitychange', refreshWhenVisible);
  };
};

export const changeUserBalance = async (userId, changeInCents) => {
  if (!Number.isSafeInteger(changeInCents) || changeInCents === 0) {
    throw new Error('The wallet change must be a non-zero whole number of cents.');
  }
  if (userId.startsWith('local-')) {
    const accounts = getLocalAccounts();
    const account = accounts.find((item) => item.id === userId);
    if (!account) throw new Error('User account not found.');
    const balanceCents = account.balanceCents + changeInCents;
    if (!Number.isSafeInteger(balanceCents) || balanceCents < 0) {
      throw new Error(balanceCents < 0
        ? 'Insufficient balance.'
        : 'The resulting balance is too large to store accurately.');
    }
    const updated = { ...account, balanceCents };
    saveLocalAccounts(accounts.map((item) => item.id === userId ? updated : item));
    return profileFromLocalAccount(updated);
  }
  const result = await requestApi(`/api/users/${encodeURIComponent(userId)}/balance`, {
    method: 'POST',
    body: JSON.stringify({ changeInCents })
  });
  return result.user;
};
