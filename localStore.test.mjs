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
