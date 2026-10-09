import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import {
  changeUserBalance,
  createAccount,
  getCurrentSession,
  isEmailRegistered,
  logOutUser,
  observeAllUserProfiles,
  signInWithPassword
} from './src/localStore.js';

const USERS_KEY = 'dollarcraft-local-users-v1';
const SESSION_KEY = 'dollarcraft-local-session-v1';
const ADMIN_EMAIL = 'dollarcraft3@gmail.com';
const LEGACY_USERS_KEY = 'dollarcraft-users';
const LEGACY_SESSION_KEY = 'dollarcraft-session';

beforeEach(() => {
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: (key) => values.delete(key)
    },
    addEventListener() {},
    removeEventListener() {}
  };
});

test('migrates legacy plaintext passwords to PBKDF2 hashes and removes old keys', async () => {
  const validLegacyUsers = [{
    email: 'legacy@example.com',
    password: 'legacy-password-123',
    name: 'Legacy User',
    balanceCents: 415
  }];
  window.localStorage.setItem(LEGACY_USERS_KEY, JSON.stringify([{
    email: 'incomplete@example.com',
    name: 'Incomplete User'
  }]));
  await assert.rejects(getCurrentSession(), {
    message: 'A legacy account is incomplete; saved data was left unchanged.'
  });
  assert.equal(window.localStorage.getItem(USERS_KEY), null);
  assert.notEqual(window.localStorage.getItem(LEGACY_USERS_KEY), null);

  window.localStorage.setItem(LEGACY_USERS_KEY, JSON.stringify(validLegacyUsers));
  const setItem = window.localStorage.setItem;
  window.localStorage.setItem = (key, value) => {
    if (key === USERS_KEY) throw new Error('Storage quota exceeded.');
    setItem(key, value);
  };
  await assert.rejects(getCurrentSession(), { message: 'Storage quota exceeded.' });
  assert.equal(window.localStorage.getItem(USERS_KEY), null);
  assert.notEqual(window.localStorage.getItem(LEGACY_USERS_KEY), null);

  window.localStorage.setItem = setItem;
  window.localStorage.setItem(LEGACY_USERS_KEY, JSON.stringify(validLegacyUsers));
  window.localStorage.setItem(LEGACY_SESSION_KEY, JSON.stringify({
    userEmail: 'legacy@example.com'
  }));

  const session = await getCurrentSession();
  const savedUsers = JSON.parse(window.localStorage.getItem(USERS_KEY));

  assert.equal(session.user.email, 'legacy@example.com');
  assert.equal(savedUsers[0].balanceCents, 415);
  assert.notEqual(savedUsers[0].passwordHash, 'legacy-password-123');
  assert.equal('password' in savedUsers[0], false);
  assert.equal(window.localStorage.getItem(LEGACY_USERS_KEY), null);
  assert.equal(window.localStorage.getItem(LEGACY_SESSION_KEY), null);
});

test('registration persists the profile locally and returns no password material', async () => {
  const result = await createAccount('new@example.com', 'local-password-123', {
    firstName: 'Ada',
    lastName: 'Lovelace'
  });
  const storedUsers = JSON.parse(window.localStorage.getItem(USERS_KEY));

  assert.equal(result.user.firstName, 'Ada');
  assert.equal(result.user.lastName, 'Lovelace');
  assert.equal(result.user.email, 'new@example.com');
  assert.equal(result.user.balanceCents, 0);
  assert.equal(typeof result.user.createdAt, 'string');
  assert.equal('passwordHash' in result.user, false);
  assert.equal(storedUsers[0].passwordHash.includes('local-password-123'), false);
  assert.equal(window.localStorage.getItem(SESSION_KEY), JSON.stringify({ userId: result.user.id }));
});

test('registration immediately publishes profile changes to admin subscribers', async () => {
  let latestUsers = [];
  const unsubscribe = observeAllUserProfiles((users) => {
    latestUsers = users;
  }, (error) => {
    throw error;
  });

  await createAccount('instant@example.com', 'local-password-123', {
    firstName: 'Instant',
    lastName: 'User'
  });

  assert.equal(latestUsers.length, 1);
  assert.equal(latestUsers[0].email, 'instant@example.com');
  unsubscribe();
});

test('registered email lookup is case-insensitive and checks local user storage', async () => {
  await createAccount('lookup@example.com', 'local-password-123', {
    firstName: 'Lookup',
    lastName: 'User'
  });

  assert.equal(await isEmailRegistered('LOOKUP@example.com'), true);
  assert.equal(await isEmailRegistered('missing@example.com'), false);
});

test('local sign-in verifies the password and grants the admin role only to the admin email', async () => {
  await createAccount(ADMIN_EMAIL, 'admin-local-password-123', {
    firstName: 'Admin',
    lastName: 'User'
  });
  await logOutUser();

  await assert.rejects(
    signInWithPassword(ADMIN_EMAIL, 'wrong-password'),
    { message: 'Incorrect email or password.' }
  );
  const admin = await signInWithPassword(ADMIN_EMAIL, 'admin-local-password-123');
  assert.equal(admin.isAdmin, true);

  const customer = await createAccount('customer@example.com', 'customer-password-123', {
    firstName: 'Casey',
    lastName: 'Customer'
  });
  assert.equal(customer.isAdmin, false);
});

test('restores local sessions and persists wallet updates to subscribers', async () => {
  const { user } = await createAccount('wallet@example.com', 'local-password-123', {
    firstName: 'Wallet',
    lastName: 'User'
  });
  const session = await getCurrentSession();
  assert.equal(session.user.id, user.id);

  let latestUsers;
  const unsubscribe = observeAllUserProfiles((users) => {
    latestUsers = users;
  }, (error) => {
    throw error;
  });
  await changeUserBalance(user.id, 250);

  assert.equal(latestUsers[0].balanceCents, 250);
  assert.equal(JSON.parse(window.localStorage.getItem(USERS_KEY))[0].balanceCents, 250);
  await assert.rejects(changeUserBalance(user.id, -300), {
    message: 'The wallet balance is insufficient or too large.'
  });
  unsubscribe();

  await logOutUser();
  assert.equal(await getCurrentSession(), null);
});
