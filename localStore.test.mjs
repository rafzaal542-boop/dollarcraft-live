import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import {
  changeUserBalance,
  createAccount,
  getCurrentSession,
  logOutUser,
  observeAllUserProfiles,
  saveLocalSessionRole,
  signInWithPassword
} from './src/localStore.js';

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
const originalLocalStorage = globalThis.localStorage;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  if (originalLocalStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = originalLocalStorage;
});

const createStorage = () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  return values;
};

const createWindow = () => {
  const listeners = new Map();
  globalThis.window = {
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(callback);
    },
    removeEventListener(type, callback) {
      listeners.get(type)?.delete(callback);
    },
    dispatchEvent(event) {
      listeners.get(event.type)?.forEach((callback) => callback(event));
    }
  };
};

test('registration stores a persistent profile and salted password hash without contacting an API', async () => {
  const values = createStorage();
  globalThis.fetch = async () => {
    throw new Error('Registration must not call fetch.');
  };

  const result = await createAccount('NEW@example.com', 'secure-password-123', {
    firstName: 'Ada',
    lastName: 'Lovelace'
  });
  const accounts = JSON.parse(values.get('dollarcraft.localAccounts.v1'));

  assert.equal(result.user.email, 'new@example.com');
  assert.equal(result.user.firstName, 'Ada');
  assert.equal(result.user.lastName, 'Lovelace');
  assert.equal(result.user.balanceCents, 0);
  assert.ok(Number.isFinite(Date.parse(result.user.createdAt)));
  assert.equal(accounts.length, 1);
  assert.notEqual(accounts[0].passwordHash, 'secure-password-123');
  assert.equal(accounts[0].passwordHash.length, 64);
  assert.equal(accounts[0].passwordSalt.length, 32);
  assert.equal('password' in accounts[0], false);
  assert.equal(values.get('dollarcraft.localSession.v1'), result.user.id);
});

test('registration rejects duplicate emails and login verifies the stored password hash', async () => {
  createStorage();
  const account = await createAccount('new@example.com', 'secure-password-123', {
    firstName: 'Ada',
    lastName: 'Lovelace'
  });

  await assert.rejects(
    createAccount('NEW@example.com', 'another-password', {
      firstName: 'Another',
      lastName: 'User'
    }),
    { message: 'An account with this email already exists.' }
  );
  await assert.rejects(
    signInWithPassword('new@example.com', 'incorrect-password'),
    { message: 'Incorrect email or password.' }
  );

  const signedIn = await signInWithPassword('NEW@example.com', 'secure-password-123');
  assert.equal(signedIn.user.id, account.user.id);
  assert.equal((await getCurrentSession()).user.id, account.user.id);
  await logOutUser();
  assert.equal((await getCurrentSession()).user, null);
});

test('Users History observes local registrations immediately and across storage events', async () => {
  const values = createStorage();
  createWindow();
  const published = [];
  const errors = [];
  const unsubscribe = observeAllUserProfiles(
    (users) => published.push(users),
    (error) => errors.push(error)
  );

  const account = await createAccount('new@example.com', 'secure-password-123', {
    firstName: 'Ada',
    lastName: 'Lovelace'
  });
  assert.equal(published.at(-1)[0].id, account.user.id);
  assert.equal(published.at(-1)[0].email, 'new@example.com');

  values.set('dollarcraft.localAccounts.v1', JSON.stringify([{
    id: 'other-local-user',
    firstName: 'Grace',
    lastName: 'Hopper',
    email: 'grace@example.com',
    createdAt: new Date().toISOString(),
    balanceCents: 2500,
    passwordSalt: 'salt',
    passwordHash: 'hash'
  }]));
  globalThis.window.dispatchEvent({
    type: 'storage',
    key: 'dollarcraft.localAccounts.v1'
  });
  assert.deepEqual(
    published.at(-1).map((user) => user.email),
    ['grace@example.com']
  );
  assert.deepEqual(errors, []);
  unsubscribe();
});

test('wallet changes persist locally and reject insufficient or unsafe balances', async () => {
  createStorage();
  const account = await createAccount('new@example.com', 'secure-password-123', {
    firstName: 'Ada',
    lastName: 'Lovelace'
  });

  const credited = await changeUserBalance(account.user.id, 2500);
  assert.equal(credited.balanceCents, 2500);
  await assert.rejects(
    changeUserBalance(account.user.id, -3000),
    { message: 'Insufficient balance.' }
  );
  const accounts = JSON.parse(globalThis.localStorage.getItem('dollarcraft.localAccounts.v1'));
  assert.equal(accounts[0].balanceCents, 2500);
});

test('local admin role is restricted to the configured admin email and persists in session', async () => {
  createStorage();
  const admin = await createAccount('dollarcraft3@gmail.com', 'admin-password', {
    firstName: 'Dollar',
    lastName: 'Craft'
  });
  saveLocalSessionRole('admin');
  assert.equal((await getCurrentSession()).user.role, 'admin');

  await logOutUser();
  await createAccount('user@example.com', 'user-password', {
    firstName: 'Regular',
    lastName: 'User'
  });
  assert.throws(
    () => saveLocalSessionRole('admin'),
    { message: 'Cannot save the admin role without a matching local admin session.' }
  );
  assert.ok(admin.user.id);
});
