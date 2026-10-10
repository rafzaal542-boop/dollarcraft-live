import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import {
  changeUserBalance,
  createAccount,
  getCurrentSession,
  logOutUser,
  observeAllUserProfiles,
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

test('HTML API 404 falls back to persistent local registration and authentication', async () => {
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

  const registration = await createAccount('new@example.com', 'secure-password-123', {
    firstName: 'Ada',
    lastName: 'Lovelace'
  });
  const savedAccounts = JSON.parse(values.get('dollarcraft.localAccounts.v1'));

  assert.equal(registration.isLocal, true);
  assert.equal(registration.isAdmin, false);
  assert.equal(registration.user.email, 'new@example.com');
  assert.match(registration.user.id, /^local-/);
  assert.equal(values.get('dollarcraft.localSession.v1'), registration.user.id);
  assert.equal(savedAccounts.length, 1);
  assert.equal(savedAccounts[0].passwordHash.includes('secure-password-123'), false);
  assert.equal('password' in registration.user, false);

  const session = await getCurrentSession();
  const login = await signInWithPassword('NEW@example.com', 'secure-password-123');
  assert.equal(session.user.id, registration.user.id);
  assert.equal(login.user.id, registration.user.id);
  await assert.rejects(
    signInWithPassword('new@example.com', 'incorrect-password'),
    { message: 'Incorrect email or password.' }
  );
  await logOutUser();
  assert.equal(values.has('dollarcraft.localSession.v1'), false);
});

test('local registrations immediately publish in the admin user observer', async () => {
  const values = new Map();
  const listeners = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  globalThis.window = {
    setInterval: () => 17,
    clearInterval() {},
    addEventListener(type, callback) {
      listeners.set(type, callback);
    },
    removeEventListener(type) {
      listeners.delete(type);
    },
    dispatchEvent(event) {
      listeners.get(event.type)?.(event);
    }
  };
  globalThis.fetch = async () => new Response(
    '<!doctype html><title>Not Found</title>',
    { status: 404, headers: { 'Content-Type': 'text/html' } }
  );

  const published = [];
  const unsubscribe = observeAllUserProfiles((users) => published.push(users), (error) => {
    throw error;
  });
  await new Promise((resolve) => setImmediate(resolve));
  await createAccount('new@example.com', 'secure-password-123', {
    firstName: 'Ada',
    lastName: 'Lovelace'
  });
  unsubscribe();

  assert.equal(published.at(-1)[0].email, 'new@example.com');
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

test('admin user observation immediately loads the API and refreshes every five seconds', async () => {
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

  assert.equal(intervalDelay, 5000);
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

test('non-JSON authentication errors fall back to local registration and login', async () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  globalThis.fetch = async () => new Response(
    '<!doctype html><title>Unauthorized</title>',
    { status: 401, headers: { 'Content-Type': 'text/html' } }
  );

  const registration = await createAccount('new@example.com', 'secure-password-123', {
    firstName: 'Ada',
    lastName: 'Lovelace'
  });
  const login = await signInWithPassword('new@example.com', 'secure-password-123');

  assert.equal(registration.isLocal, true);
  assert.equal(login.user.id, registration.user.id);
  assert.equal(JSON.parse(values.get('dollarcraft.localAccounts.v1')).length, 1);
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
