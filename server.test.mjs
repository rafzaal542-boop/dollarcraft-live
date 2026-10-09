import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { createApiServer } from './server.mjs';

const ADMIN_EMAIL = 'dollarcraft3@gmail.com';
const ADMIN_PASSWORD = 'test-only-admin-password-123';

let dataDir;
let server;
let origin;

beforeEach(async () => {
  dataDir = await mkdtemp(path.join(os.tmpdir(), 'dollarcraft-api-'));
  server = createApiServer({ dataDir, adminPassword: ADMIN_PASSWORD });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  await rm(dataDir, { recursive: true, force: true });
});

const post = (url, body, cookie = '') =>
  fetch(`${origin}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: JSON.stringify(body)
  });

const sessionCookie = (response) => response.headers.get('set-cookie').split(';')[0];

test('registers accounts with hashed passwords and returns no credential hashes', async () => {
  const response = await post('/api/auth/register', {
    email: 'reader@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    password: 'account-password-123'
  });
  const payload = await response.json();
  const savedUsers = JSON.parse(await readFile(path.join(dataDir, 'users.json'), 'utf8'));

  assert.equal(response.status, 201);
  assert.equal(payload.user.email, 'reader@example.com');
  assert.equal(payload.user.balanceCents, 0);
  assert.equal('passwordHash' in payload.user, false);
  assert.equal(savedUsers.length, 1);
  assert.notEqual(savedUsers[0].passwordHash, 'account-password-123');
  assert.equal('password' in savedUsers[0], false);
});

test('serializes duplicate registrations and does not allow registering the admin identity', async () => {
  const duplicate = await Promise.all([
    post('/api/auth/register', {
      email: 'same@example.com',
      firstName: 'One',
      lastName: 'User',
      password: 'account-password-123'
    }),
    post('/api/auth/register', {
      email: 'same@example.com',
      firstName: 'Two',
      lastName: 'User',
      password: 'account-password-456'
    })
  ]);
  const admin = await post('/api/auth/register', {
    email: ADMIN_EMAIL,
    firstName: 'Admin',
    lastName: 'User',
    password: ADMIN_PASSWORD
  });

  assert.deepEqual(duplicate.map((response) => response.status).sort(), [201, 409]);
  assert.equal(admin.status, 403);
});

test('requires the configured admin email and password and protects the admin stream', async () => {
  const rejectedEmail = await post('/api/auth/login', {
    email: 'other@example.com',
    password: ADMIN_PASSWORD
  });
  const rejectedPassword = await post('/api/auth/login', {
    email: ADMIN_EMAIL,
    password: 'incorrect-password'
  });
  const accepted = await post('/api/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  const login = await accepted.json();
  const profileStream = await fetch(`${origin}/api/users/events`, {
    headers: { Cookie: sessionCookie(accepted) }
  });

  assert.equal(rejectedEmail.status, 401);
  assert.equal(rejectedPassword.status, 401);
  assert.equal(login.isAdmin, true);
  assert.equal(login.user.email, ADMIN_EMAIL);
  assert.equal(profileStream.status, 200);
  await profileStream.body.cancel();
});

test('blocks user balance credits and persists authorized wallet changes', async () => {
  const registration = await post('/api/auth/register', {
    email: 'wallet@example.com',
    firstName: 'Wallet',
    lastName: 'User',
    password: 'account-password-123'
  });
  const registered = await registration.json();
  const cookie = sessionCookie(registration);
  const unauthorizedCredit = await post('/api/wallet/change', {
    userId: registered.user.id,
    changeInCents: 100
  }, cookie);

  assert.equal(unauthorizedCredit.status, 403);

  const adminLogin = await post('/api/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  const transfer = await post('/api/wallet/change', {
    userId: registered.user.id,
    changeInCents: 1250
  }, sessionCookie(adminLogin));
  const changed = await transfer.json();
  const savedUsers = JSON.parse(await readFile(path.join(dataDir, 'users.json'), 'utf8'));

  assert.equal(transfer.status, 200);
  assert.equal(changed.user.balanceCents, 1250);
  assert.equal(savedUsers[0].balanceCents, 1250);
});
