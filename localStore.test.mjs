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

const mockJsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

test('registration sends account details to the backend and returns its profile', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return mockJsonResponse({
      user: {
        id: 'user-1',
        email: 'new@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        balanceCents: 0
      },
      isAdmin: false
    }, 201);
  };

  const result = await createAccount('new@example.com', 'secure-password-123', {
    firstName: 'Ada',
    lastName: 'Lovelace'
  });

  assert.equal(request.url, '/api/auth/register');
  assert.equal(request.options.credentials, 'same-origin');
  assert.deepEqual(JSON.parse(request.options.body), {
    email: 'new@example.com',
    password: 'secure-password-123',
    firstName: 'Ada',
    lastName: 'Lovelace'
  });
  assert.equal(result.user.id, 'user-1');
  assert.equal('password' in result.user, false);
});

test('registration fails when the backend is unavailable instead of creating a local-only account', async () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  globalThis.fetch = async () => new Response(
    '<!doctype html><title>Not Found</title>',
    { status: 404, headers: { 'Content-Type': 'text/html' } }
  );

  await assert.rejects(
    createAccount('new@example.com', 'pass1234', {
      firstName: 'Ada',
      lastName: 'Lovelace'
    }),
    { message: 'The account service is unavailable.' }
  );
  assert.equal(values.has('dollarcraft.localAccounts.v1'), false);
  assert.equal(values.has('dollarcraft.localSession.v1'), false);
});

test('admin user observer shows only backend users and retains the last server snapshot on failure', async () => {
  globalThis.localStorage = {
    getItem: (key) => key === 'dollarcraft.localAccounts.v1'
      ? JSON.stringify([{
        id: 'local-user',
        firstName: 'Local',
        lastName: 'Only',
        email: 'local@example.com',
        createdAt: new Date().toISOString(),
        balanceCents: 0,
        passwordSalt: 'salt',
        passwordHash: 'hash'
      }])
      : null,
    setItem() {},
    removeItem() {}
  };
  let intervalCallback;
  const errors = [];
  const published = [];
  globalThis.window = {
    setInterval(callback) {
      intervalCallback = callback;
      return 17;
    },
    clearInterval() {}
  };
  let shouldFail = false;
  globalThis.fetch = async () => {
    if (shouldFail) throw new TypeError('Network unavailable');
    return mockJsonResponse({
      users: [{ id: 'user-1', email: 'global@example.com' }]
    });
  };

  const unsubscribe = observeAllUserProfiles(
    (users) => published.push(users),
    (error) => errors.push(error)
  );
  await new Promise((resolve) => setImmediate(resolve));
  shouldFail = true;
  intervalCallback();
  await new Promise((resolve) => setImmediate(resolve));
  unsubscribe();

  assert.equal(published.length, 1);
  assert.deepEqual(published[0].map((user) => user.email), ['global@example.com']);
  assert.equal(errors.length, 1);
});

test('sign-in, session restoration, and sign-out use the shared API', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url === '/api/auth/session') {
      return mockJsonResponse({ user: null, isAdmin: false });
    }
    if (url === '/api/auth/logout') {
      return new Response(null, { status: 204 });
    }
    return mockJsonResponse({
      user: { id: 'user-1', email: 'user@example.com' },
      isAdmin: false
    });
  };

  const login = await signInWithPassword('user@example.com', 'secure-password-123');
  const session = await getCurrentSession();
  await logOutUser();

  assert.equal(login.user.id, 'user-1');
  assert.equal(session.user, null);
  assert.deepEqual(calls.map(({ url }) => url), [
    '/api/auth/login',
    '/api/auth/session',
    '/api/auth/logout'
  ]);
});

test('admin user observation immediately loads the API and refreshes every two seconds', async () => {
  let intervalCallback;
  let intervalDelay;
  let clearedInterval;
  const published = [];
  globalThis.window = {
    setInterval(callback, delay) {
      intervalCallback = callback;
      intervalDelay = delay;
      return 17;
    },
    clearInterval(id) {
      clearedInterval = id;
    }
  };
  globalThis.fetch = async () => mockJsonResponse({
    users: [{ id: 'user-1', email: 'user@example.com' }]
  });

  const unsubscribe = observeAllUserProfiles((users) => published.push(users), (error) => {
    throw error;
  });
  await new Promise((resolve) => setImmediate(resolve));
  intervalCallback();
  await new Promise((resolve) => setImmediate(resolve));
  unsubscribe();

  assert.equal(intervalDelay, 2000);
  assert.equal(published.length, 2);
  assert.equal(published[0][0].email, 'user@example.com');
  assert.equal(clearedInterval, 17);
});

test('API failures are surfaced to callers', async () => {
  globalThis.fetch = async () => mockJsonResponse({
    error: 'Incorrect email or password.'
  }, 401);

  await assert.rejects(
    signInWithPassword('user@example.com', 'incorrect-password'),
    { message: 'Incorrect email or password.' }
  );
});

test('non-JSON registration errors do not create browser-local accounts', async () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  globalThis.fetch = async () => new Response(
    '<!doctype html><title>Not Found</title>',
    { status: 404, headers: { 'Content-Type': 'text/html' } }
  );

  await assert.rejects(
    createAccount('new@example.com', 'secure-password-123', {
      firstName: 'Ada',
      lastName: 'Lovelace'
    }),
    { message: 'The account service is unavailable.' }
  );
  assert.equal(values.has('dollarcraft.localAccounts.v1'), false);
});

test('local admin role persists in the session and is restored only for the admin email', async () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  values.set('dollarcraft.localAccounts.v1', JSON.stringify([{
    id: 'local-admin',
    firstName: 'Dollar',
    lastName: 'Craft',
    email: 'dollarcraft3@gmail.com',
    createdAt: new Date().toISOString(),
    balanceCents: 0,
    passwordSalt: 'salt',
    passwordHash: 'hash'
  }]));
  values.set('dollarcraft.localSession.v1', 'local-admin');
  globalThis.fetch = async () => new Response(
    '<!doctype html><title>Not Found</title>',
    { status: 404, headers: { 'Content-Type': 'text/html' } }
  );

  saveLocalSessionRole('admin');

  const session = await getCurrentSession();
  assert.equal(values.get('dollarcraft.localSessionRole.v1'), 'admin');
  assert.equal(session.isAdmin, true);
  assert.equal(session.user.role, 'admin');

  await logOutUser();
  assert.equal(values.has('dollarcraft.localSessionRole.v1'), false);
});

test('wallet changes are submitted to the server for authorization and persistence', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return mockJsonResponse({ user: { id: 'user-1', balanceCents: 500 } });
  };

  await changeUserBalance('user-1', -1000);

  assert.equal(request.url, '/api/users/user-1/balance');
  assert.deepEqual(JSON.parse(request.options.body), { changeInCents: -1000 });
});
