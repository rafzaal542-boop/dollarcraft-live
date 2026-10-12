const LOCAL_ACCOUNTS_KEY = 'dollarcraft.localAccounts.v1';
const LOCAL_SESSION_KEY = 'dollarcraft.localSession.v1';
const LOCAL_SESSION_ROLE_KEY = 'dollarcraft.localSessionRole.v1';
const LOCAL_USERS_EVENT = 'dollarcraft:local-users-changed';

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

const publishLocalUsersChanged = () => {
  if (
    typeof globalThis.window?.dispatchEvent === 'function' &&
    typeof globalThis.Event === 'function'
  ) {
    globalThis.window.dispatchEvent(new Event(LOCAL_USERS_EVENT));
  }
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
  publishLocalUsersChanged();
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
  publishLocalUsersChanged();
};

const createLocalAccount = async (email, password, profile) => {
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !profile ||
    typeof profile.firstName !== 'string' ||
    typeof profile.lastName !== 'string'
  ) {
    throw new Error('Enter valid names and email, and a password of 1 to 128 characters.');
  }

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
  if (existingAccount) {
    throw new Error('An account with this email already exists.');
  }

  const salt = existingAccount?.passwordSalt || Array.from(
    getCrypto().getRandomValues(new Uint8Array(16)),
    (byte) => byte.toString(16).padStart(2, '0')
  ).join('');
  const account = {
    id: existingAccount?.id || `local-${salt}`,
    firstName,
    lastName,
    email: normalizedEmail,
    createdAt: profile.createdAt || new Date().toISOString(),
    balanceCents: Number.isSafeInteger(profile.balanceCents) ? profile.balanceCents : 0,
    passwordSalt: salt,
    passwordHash: await createPasswordHash(password, new TextEncoder().encode(salt))
  };
  saveLocalAccount(account);
  getLocalStorage().setItem(LOCAL_SESSION_KEY, account.id);
  getLocalStorage().removeItem(LOCAL_SESSION_ROLE_KEY);
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

export const getCurrentSession = async () => getLocalSession();

export const createAccount = (email, password, profile) =>
  createLocalAccount(email, password, profile);

export const signInWithPassword = (email, password) =>
  signInLocalAccount(email, password);

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
  globalThis.localStorage?.removeItem(LOCAL_SESSION_KEY);
  globalThis.localStorage?.removeItem(LOCAL_SESSION_ROLE_KEY);
};

export const observeAllUserProfiles = (onUsers, onError) => {
  let active = true;

  const publishProfiles = () => {
    try {
      if (active) onUsers(getLocalProfiles());
    } catch (error) {
      if (active) onError(error);
    }
  };

  publishProfiles();
  const onStorage = (event) => {
    if (event.key === LOCAL_ACCOUNTS_KEY || event.key === null) publishProfiles();
  };
  globalThis.window?.addEventListener?.(LOCAL_USERS_EVENT, publishProfiles);
  globalThis.window?.addEventListener?.('storage', onStorage);
  return () => {
    active = false;
    globalThis.window?.removeEventListener?.(LOCAL_USERS_EVENT, publishProfiles);
    globalThis.window?.removeEventListener?.('storage', onStorage);
  };
};

export const observeUserProfile = (userId, onUser, onError) => {
  let active = true;
  const refresh = () => {
    try {
      const localUser = getLocalProfiles().find((profile) => profile.id === userId) || null;
      if (active) onUser(localUser);
    } catch (error) {
      if (active) onError(error);
    }
  };

  refresh();
  const onStorage = (event) => {
    if (event.key === LOCAL_ACCOUNTS_KEY || event.key === null) refresh();
  };
  globalThis.window?.addEventListener?.(LOCAL_USERS_EVENT, refresh);
  globalThis.window?.addEventListener?.('storage', onStorage);
  return () => {
    active = false;
    globalThis.window?.removeEventListener?.(LOCAL_USERS_EVENT, refresh);
    globalThis.window?.removeEventListener?.('storage', onStorage);
  };
};

export const changeUserBalance = async (userId, changeInCents) => {
  if (!Number.isSafeInteger(changeInCents) || changeInCents === 0) {
    throw new Error('The wallet change must be a non-zero whole number of cents.');
  }
  const accounts = readLocalAccounts();
  const account = accounts.find((item) => item.id === userId);
  if (!account) throw new Error('User account not found.');

  const balanceCents = account.balanceCents + changeInCents;
  if (!Number.isSafeInteger(balanceCents) || balanceCents < 0) {
    throw new Error(balanceCents < 0
      ? 'Insufficient balance.'
      : 'The resulting balance is too large to store accurately.');
  }
  updateLocalAccountProfile({
    ...profileFromLocalAccount(account),
    balanceCents
  });
  return { ...profileFromLocalAccount(account), balanceCents };
};
