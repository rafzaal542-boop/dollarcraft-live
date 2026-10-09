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

afterEach(() => {
  globalThis.fetch = originalFetch;
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
