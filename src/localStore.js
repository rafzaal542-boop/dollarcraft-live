const REFRESH_INTERVAL_MS = 2000;
const LOCAL_ACCOUNTS_KEY = 'dollarcraft.localAccounts.v1';
const LOCAL_SESSION_KEY = 'dollarcraft.localSession.v1';
const LOCAL_SESSION_ROLE_KEY = 'dollarcraft.localSessionRole.v1';

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
      if (!response.ok && (response.status === 404 || response.status >= 500)) {
        throw new ApiUnavailableError('The account service is unavailable.');
      }
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

const profileFromLocalAccount = (account) => ({
  id: account.id,
  firstName: account.firstName,
  lastName: account.lastName,
  name: `${account.firstName} ${account.lastName}`.trim(),
  email: account.email,
  createdAt: account.createdAt,
  balanceCents: account.balanceCents
});

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

const localAuthResult = (account, role = 'user') => ({
  user: { ...profileFromLocalAccount(account), role },
  isAdmin: role === 'admin',
  isLocal: true
});

const saveLocalAccount = (account) => {
  const accounts = readLocalAccounts();
  const accountIndex = accounts.findIndex(
    (item) => item.email.toLowerCase() === account.email.toLowerCase()
  );
  if (accountIndex === -1) {
    accounts.push(account);
  } else {
    accounts[accountIndex] = account;
  }
  getLocalStorage().setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
};

const updateLocalAccountProfile = (profile) => {
  if (!globalThis.localStorage) return;
  const accounts = readLocalAccounts();
  const accountIndex = accounts.findIndex(
    (account) => account.email.toLowerCase() === profile.email.toLowerCase()
  );
  if (accountIndex === -1) return;

  accounts[accountIndex] = {
    ...accounts[accountIndex],
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    createdAt: profile.createdAt,
    balanceCents: profile.balanceCents
  };
  getLocalStorage().setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
};

const createLocalAccount = async (email, password, profile, { startSession }) => {
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
    password.length < 1 ||
    password.length > 128 ||
    new TextEncoder().encode(password).length > 512
  ) {
    throw new Error('Enter valid names and email, and a password of 1 to 128 characters.');
  }

  const existingAccounts = readLocalAccounts();
  const existingAccount = existingAccounts.find(
    (account) => account.email.toLowerCase() === normalizedEmail
  );
  if (startSession && existingAccount) {
    throw new Error('An account with this email already exists.');
  }

  const salt = existingAccount?.passwordSalt || Array.from(
    getCrypto().getRandomValues(new Uint8Array(16)),
    (byte) => byte.toString(16).padStart(2, '0')
  ).join('');
  const account = {
    id: profile.id || existingAccount?.id || `local-${salt}`,
    firstName,
    lastName,
    email: normalizedEmail,
    createdAt: profile.createdAt || new Date().toISOString(),
    balanceCents: Number.isSafeInteger(profile.balanceCents) ? profile.balanceCents : 0,
    passwordSalt: salt,
    passwordHash: await createPasswordHash(password, new TextEncoder().encode(salt))
  };
  saveLocalAccount(account);
  if (startSession) {
    getLocalStorage().setItem(LOCAL_SESSION_KEY, account.id);
    getLocalStorage().removeItem(LOCAL_SESSION_ROLE_KEY);
  }
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
  getLocalStorage().removeItem(LOCAL_SESSION_ROLE_KEY);
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
    getLocalStorage().removeItem(LOCAL_SESSION_ROLE_KEY);
    return { user: null, isAdmin: false, isLocal: true };
  }
  const role = getLocalStorage().getItem(LOCAL_SESSION_ROLE_KEY);
  return localAuthResult(
    account,
    role === 'admin' && account.email.toLowerCase() === 'dollarcraft3@gmail.com'
      ? 'admin'
      : 'user'
  );
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

export const createAccount = async (email, password, profile) => {
  try {
    const result = await post('/api/auth/register', {
      email,
      password,
      firstName: profile.firstName,
      lastName: profile.lastName
    });
    try {
      await createLocalAccount(email, password, {
        ...result.user,
        ...profile
      }, { startSession: false });
    } catch (error) {
      console.error('Unable to save the registered account to local shared storage.', error);
    }
    return result;
  } catch (error) {
    if (!(error instanceof ApiUnavailableError)) throw error;
    return createLocalAccount(email, password, profile, { startSession: true });
  }
};

export const signInWithPassword = (email, password) =>
  post('/api/auth/login', { email, password }).catch((error) => {
    if (!(error instanceof ApiUnavailableError)) throw error;
    return signInLocalAccount(email, password);
  });

export const saveLocalSessionRole = (role) => {
  if (role !== 'admin') {
    throw new Error('Only the admin role can be saved to a local session.');
  }
  const storage = getLocalStorage();
  const sessionId = storage.getItem(LOCAL_SESSION_KEY);
  const account = readLocalAccounts().find((item) => item.id === sessionId);
  if (!account || account.email.toLowerCase() !== 'dollarcraft3@gmail.com') {
    throw new Error('Cannot save the admin role without a matching local admin session.');
  }
  storage.setItem(LOCAL_SESSION_ROLE_KEY, role);
};

export const logOutUser = async () => {
  try {
    await post('/api/auth/logout', {});
  } catch (error) {
    if (!(error instanceof ApiUnavailableError)) throw error;
  } finally {
    globalThis.localStorage?.removeItem(LOCAL_SESSION_KEY);
    globalThis.localStorage?.removeItem(LOCAL_SESSION_ROLE_KEY);
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
      if (!Array.isArray(result?.users)) {
        throw new Error('The account service returned an invalid registered-user list.');
      }
      remoteUsers = result.users;
      publishProfiles();
    } catch (error) {
      try {
        publishProfiles();
      } catch (storageError) {
        if (active) onError(storageError);
      }
      if (active) onError(error);
    } finally {
      requestInProgress = false;
    }
  };

  try {
    publishProfiles();
  } catch (error) {
    if (active) onError(error);
  }
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
  try {
    updateLocalAccountProfile(result.user);
  } catch (error) {
    console.error('Unable to update the local registered-user cache after a wallet change.', error);
  }
  return result.user;
};
