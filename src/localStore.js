const USERS_STORAGE_KEY = 'dollarcraft-local-users-v1';
const SESSION_STORAGE_KEY = 'dollarcraft-local-session-v1';
const LEGACY_USERS_STORAGE_KEY = 'dollarcraft-users';
const LEGACY_SESSION_STORAGE_KEY = 'dollarcraft-session';
const ADMIN_EMAIL = 'dollarcraft3@gmail.com';
const PASSWORD_ITERATIONS = 310_000;
const PASSWORD_LENGTH = 256;
const PASSWORD_SALT_LENGTH = 16;
const listeners = new Set();
let initializationPromise;

const getStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('Browser local storage is unavailable.');
  }
  return window.localStorage;
};

const getCrypto = () => {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues) {
    throw new Error('Secure browser cryptography is unavailable in this context.');
  }
  return globalThis.crypto;
};

const readUsers = () => {
  const savedUsers = getStorage().getItem(USERS_STORAGE_KEY);
  if (!savedUsers) return [];

  const users = JSON.parse(savedUsers);
  if (!Array.isArray(users)) {
    throw new Error('Saved local account data is invalid.');
  }
  return users;
};

const getPublicProfile = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  name: user.name,
  createdAt: user.createdAt,
  balanceCents: user.balanceCents
});

const publishUsers = (users) => {
  const profiles = users.map(getPublicProfile);
  listeners.forEach((listener) => listener(profiles));
};

const persistUsers = (users) => {
  getStorage().setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  publishUsers(users);
};

const initializeLocalStore = () => {
  if (initializationPromise) return initializationPromise;
  initializationPromise = (async () => {
    const storage = getStorage();
    const savedUsers = storage.getItem(USERS_STORAGE_KEY);
    const legacyData = storage.getItem(LEGACY_USERS_STORAGE_KEY);
    if (savedUsers) {
      if (legacyData) {
        storage.removeItem(LEGACY_USERS_STORAGE_KEY);
        storage.removeItem(LEGACY_SESSION_STORAGE_KEY);
      }
      return;
    }
    if (!legacyData) return;
    const legacyUsers = JSON.parse(legacyData);
    if (!Array.isArray(legacyUsers)) {
      throw new Error('Legacy account data is invalid; it was left unchanged.');
    }
    const legacySessionData = storage.getItem(LEGACY_SESSION_STORAGE_KEY);
    const legacySession = legacySessionData ? JSON.parse(legacySessionData) : null;

    const crypto = getCrypto();
    const migratedUsers = [];
    for (const legacyUser of legacyUsers) {
      if (
        !legacyUser ||
        typeof legacyUser.email !== 'string' ||
        typeof legacyUser.password !== 'string' ||
        typeof legacyUser.name !== 'string'
      ) {
        throw new Error('A legacy account is incomplete; saved data was left unchanged.');
      }

      const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_SALT_LENGTH));
      const nameParts = legacyUser.name.trim().split(/\s+/).filter(Boolean);
      const firstName = legacyUser.firstName || nameParts[0] || '';
      const lastName = legacyUser.lastName || nameParts.slice(1).join(' ');
      migratedUsers.push({
        id: crypto.randomUUID(),
        email: legacyUser.email.trim().toLowerCase(),
        firstName,
        lastName,
        name: legacyUser.name,
        createdAt: legacyUser.createdAt || legacyUser.registrationTime || null,
        balanceCents: Number.isSafeInteger(legacyUser.balanceCents) && legacyUser.balanceCents >= 0
          ? legacyUser.balanceCents
          : 0,
        passwordSalt: bytesToHex(salt),
        passwordHash: bytesToHex(await hashPassword(legacyUser.password, salt))
      });
    }

    storage.setItem(USERS_STORAGE_KEY, JSON.stringify(migratedUsers));
    if (legacySession) {
      const sessionUser = migratedUsers.find(
        (user) => typeof legacySession.userEmail === 'string'
          && user.email === legacySession.userEmail.trim().toLowerCase()
      );
      if (sessionUser) saveSession(sessionUser);
    }
    storage.removeItem(LEGACY_USERS_STORAGE_KEY);
    storage.removeItem(LEGACY_SESSION_STORAGE_KEY);
  })().catch((error) => {
    initializationPromise = null;
    throw error;
  });
  return initializationPromise;
};

const bytesToHex = (bytes) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

const hexToBytes = (hex) =>
  Uint8Array.from(hex.match(/.{2}/g) || [], (pair) => Number.parseInt(pair, 16));

const hashPassword = async (password, saltBytes) => {
  const crypto = getCrypto();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PASSWORD_ITERATIONS,
      hash: 'SHA-256'
    },
    key,
    PASSWORD_LENGTH
  );
  return new Uint8Array(hash);
};

const verifyPassword = async (password, saltHex, storedHashHex) => {
  const computedHash = await hashPassword(password, hexToBytes(saltHex));
  const storedHash = hexToBytes(storedHashHex);
  if (computedHash.length !== storedHash.length) return false;

  let difference = 0;
  for (let index = 0; index < computedHash.length; index += 1) {
    difference |= computedHash[index] ^ storedHash[index];
  }
  return difference === 0;
};

const saveSession = (user) => {
  getStorage().setItem(SESSION_STORAGE_KEY, JSON.stringify({ userId: user.id }));
};

const toAuthResult = (user) => ({
  user: getPublicProfile(user),
  isAdmin: user.email.toLowerCase() === ADMIN_EMAIL
});

export const getCurrentSession = async () => {
  await initializeLocalStore();
  const savedSession = getStorage().getItem(SESSION_STORAGE_KEY);
  if (!savedSession) return null;

  const session = JSON.parse(savedSession);
  const user = readUsers().find((item) => item.id === session.userId);
  if (!user) {
    getStorage().removeItem(SESSION_STORAGE_KEY);
    return null;
  }
  return toAuthResult(user);
};

export const createAccount = async (email, password, profile) => {
  await initializeLocalStore();
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const crypto = getCrypto();
  const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_SALT_LENGTH));
  const saltHex = bytesToHex(salt);
  const hashHex = bytesToHex(await hashPassword(password, salt));
  const user = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    firstName: profile.firstName.trim(),
    lastName: profile.lastName.trim(),
    name: `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim(),
    createdAt: new Date().toISOString(),
    balanceCents: 0,
    passwordSalt: saltHex,
    passwordHash: hashHex
  };

  const currentUsers = readUsers();
  if (currentUsers.some((item) => item.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }
  currentUsers.push(user);
  persistUsers(currentUsers);
  saveSession(user);
  return toAuthResult(user);
};

export const signInWithPassword = async (email, password) => {
  await initializeLocalStore();
  const normalizedEmail = email.trim().toLowerCase();
  const user = readUsers().find((item) => item.email.toLowerCase() === normalizedEmail);
  if (!user || !(await verifyPassword(password, user.passwordSalt, user.passwordHash))) {
    throw new Error('Incorrect email or password.');
  }

  saveSession(user);
  return toAuthResult(user);
};

export const logOutUser = async () => {
  await initializeLocalStore();
  getStorage().removeItem(SESSION_STORAGE_KEY);
};

export const observeAllUserProfiles = (onUsers, onError) => {
  const publish = () => {
    try {
      onUsers(readUsers().map(getPublicProfile));
    } catch (error) {
      onError(error);
    }
  };

  listeners.add(publish);
  const onStorage = (event) => {
    if (event.key === USERS_STORAGE_KEY || event.key === null) publish();
  };
  window.addEventListener('storage', onStorage);
  initializeLocalStore().then(publish).catch(onError);

  return () => {
    listeners.delete(publish);
    window.removeEventListener('storage', onStorage);
  };
};

export const observeUserProfile = (userId, onUser, onError) => {
  const publish = () => {
    try {
      const user = readUsers().find((item) => item.id === userId);
      onUser(user ? getPublicProfile(user) : null);
    } catch (error) {
      onError(error);
    }
  };

  listeners.add(publish);
  const onStorage = (event) => {
    if (event.key === USERS_STORAGE_KEY || event.key === null) publish();
  };
  window.addEventListener('storage', onStorage);
  initializeLocalStore().then(publish).catch(onError);

  return () => {
    listeners.delete(publish);
    window.removeEventListener('storage', onStorage);
  };
};

export const changeUserBalance = async (userId, changeInCents) => {
  await initializeLocalStore();
  if (!Number.isSafeInteger(changeInCents) || changeInCents === 0) {
    throw new Error('The wallet change must be a non-zero whole number of cents.');
  }

  const users = readUsers();
  const user = users.find((item) => item.id === userId);
  if (!user) throw new Error('User account not found.');

  const nextBalance = user.balanceCents + changeInCents;
  if (!Number.isSafeInteger(nextBalance) || nextBalance < 0) {
    throw new Error('The wallet balance is insufficient or too large.');
  }
  user.balanceCents = nextBalance;
  persistUsers(users);
  return getPublicProfile(user);
};
