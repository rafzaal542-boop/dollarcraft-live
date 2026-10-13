import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import {
  createAccount,
  getCurrentSession,
  logOutUser,
  observeAllUserProfiles,
  signInWithPassword
} from './src/localStore.js';

const originalFetch = globalThis.fetch;
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;
const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalLocalStorage = globalThis.localStorage;

afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.setInterval = originalSetInterval;
  globalThis.clearInterval = originalClearInterval;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  if (originalDocument === undefined) delete globalThis.document;
  else globalThis.document = originalDocument;
  if (originalLocalStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = originalLocalStorage;
});

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

test('registration sends all account fields to the MongoDB-backed API', async () => {
  delete globalThis.localStorage;
  let request;
  globalThis.fetch = async (path, options) => {
    request = { path, options };
    return jsonResponse({
      user: {
        id: 'server-user-id',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        createdAt: '2026-10-13T00:00:00.000Z',
        balanceCents: 0
      },
      isAdmin: false
    }, 201);
  };

  const result = await createAccount('ada@example.com', 'secure-password-123', {
    firstName: 'Ada',
    lastName: 'Lovelace'
  });

  assert.equal(request.path, '/api/auth/register');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.credentials, 'same-origin');
  assert.deepEqual(JSON.parse(request.options.body), {
    email: 'ada@example.com',
    password: 'secure-password-123',
    firstName: 'Ada',
    lastName: 'Lovelace'
  });
  assert.equal(result.user.id, 'server-user-id');
});

test('session, sign-in, and logout use the server API and surface backend errors', async () => {
  const requests = [];
  globalThis.fetch = async (path, options) => {
    requests.push({ path, options });
    if (path === '/api/auth/logout') return new Response(null, { status: 204 });
    if (path === '/api/auth/login') {
      return jsonResponse({ error: 'Incorrect email or password.' }, 401);
    }
    return jsonResponse({ user: null, isAdmin: false });
  };

  assert.deepEqual(await getCurrentSession(), { user: null, isAdmin: false });
  await assert.rejects(
    signInWithPassword('ada@example.com', 'wrong-password'),
    { message: 'Incorrect email or password.' }
  );
  await logOutUser();

  assert.deepEqual(requests.map(({ path }) => path), [
    '/api/auth/session',
    '/api/auth/login',
    '/api/auth/logout'
  ]);
});

test('authentication reports non-JSON service failures without treating them as success', async () => {
  globalThis.fetch = async () => new Response(
    '<html><body>Bad Gateway</body></html>',
    { status: 502, headers: { 'Content-Type': 'text/html' } }
  );

  await assert.rejects(
    signInWithPassword('ada@example.com', 'password'),
    { message: 'Account service unavailable (HTTP 502). Please try again.' }
  );
});

test('authentication rejects a malformed successful API response', async () => {
  globalThis.fetch = async () => new Response(
    '<html><body>Unexpected proxy response</body></html>',
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  );

  await assert.rejects(
    createAccount('ada@example.com', 'password', {
      firstName: 'Ada',
      lastName: 'Lovelace'
    }),
    { message: 'The account service returned an unreadable response. Please try again.' }
  );
});

test('registration and sign-in fall back to hashed browser-persistent accounts on API 404', async () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  globalThis.fetch = async () => jsonResponse({ error: 'API route not found.' }, 404);

  const created = await createAccount('Ada@Example.com', 'secure-password', {
    firstName: 'Ada',
    lastName: 'Lovelace'
  });
  const savedAccounts = JSON.parse(values.get('dollarcraft_global_users'));
  assert.equal(created.isLocal, true);
  assert.equal(created.user.email, 'ada@example.com');
  assert.equal(values.get('dollarcraft.localSession.v1'), created.user.id);
  assert.equal(savedAccounts.length, 1);
  assert.notEqual(savedAccounts[0].passwordHash, 'secure-password');
  assert.equal(savedAccounts[0].passwordHash.length, 64);
  assert.equal('password' in savedAccounts[0], false);

  await logOutUser();
  const signedIn = await signInWithPassword('ADA@example.com', 'secure-password');
  assert.equal(signedIn.user.id, created.user.id);
  assert.equal((await getCurrentSession()).user.id, created.user.id);
});

test('offline administrator authentication is never granted from browser storage', async () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  globalThis.fetch = async () => jsonResponse({ error: 'API route not found.' }, 404);

  await assert.rejects(
    signInWithPassword('dollarcraft3@gmail.com', 'any-password'),
    { message: 'Administrator sign-in requires the account service.' }
  );
});

test('user history loads immediately and retries after a connection failure', async () => {
  const listeners = new Map();
  let intervalCallback;
  let attempts = 0;
  const received = [];
  const errors = [];
  globalThis.window = {
    addEventListener(type, callback) {
      listeners.set(type, callback);
    },
    removeEventListener(type) {
      listeners.delete(type);
    }
  };
  globalThis.document = {
    hidden: false,
    addEventListener(type, callback) {
      listeners.set(type, callback);
    },
    removeEventListener(type) {
      listeners.delete(type);
    }
  };
  globalThis.setInterval = (callback) => {
    intervalCallback = callback;
    return 1;
  };
  globalThis.clearInterval = () => {};
  globalThis.fetch = async (path) => {
    assert.equal(path, '/api/users');
    attempts += 1;
    if (attempts === 1) throw new TypeError('network unavailable');
    return jsonResponse({ users: [{ id: 'server-user-id', email: 'ada@example.com' }] });
  };

  const unsubscribe = observeAllUserProfiles(
    (users) => received.push(users),
    (error) => errors.push(error)
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /Unable to reach the account service/);

  intervalCallback();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(attempts, 2);
  assert.deepEqual(received, [[{ id: 'server-user-id', email: 'ada@example.com' }]]);
  unsubscribe();
});
