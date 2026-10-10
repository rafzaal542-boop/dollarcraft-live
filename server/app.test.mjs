import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { ObjectId } from 'mongodb';
import { ADMIN_EMAIL, createApiApp, createPasswordRecord } from './app.js';

class MemoryCollection {
  documents = [];

  async findOne(filter) {
    if (filter.email) {
      return this.documents.find((document) => document.email === filter.email) || null;
    }
    if (filter.tokenHash) {
      return this.documents.find((document) =>
        document.tokenHash === filter.tokenHash &&
        document.expiresAt > filter.expiresAt.$gt
      ) || null;
    }
    if (filter._id) {
      return this.documents.find((document) => String(document._id) === String(filter._id)) || null;
    }
    return null;
  }

  async insertOne(document) {
    if (
      document.email &&
      this.documents.some((existing) => existing.email === document.email)
    ) {
      const error = new Error('Duplicate key');
      error.code = 11000;
      throw error;
    }
    document._id ||= new ObjectId();
    this.documents.push(document);
    return { insertedId: document._id };
  }

  find() {
    return {
      sort: () => ({
        toArray: async () => [...this.documents].sort(
          (left, right) => right.createdAt - left.createdAt
        )
      })
    };
  }

  async deleteOne(filter) {
    const index = this.documents.findIndex((document) =>
      document.tokenHash === filter.tokenHash
    );
    if (index === -1) return { deletedCount: 0 };
    this.documents.splice(index, 1);
    return { deletedCount: 1 };
  }

  async updateOne(filter, update) {
    const document = this.documents.find((item) =>
      String(item._id) === String(filter._id)
    );
    if (!document) return { modifiedCount: 0 };
    if (
      filter.balanceCents &&
      document.balanceCents < filter.balanceCents.$gte
    ) {
      return { modifiedCount: 0 };
    }
    if (
      filter.$expr &&
      document.balanceCents + update.$inc.balanceCents > Number.MAX_SAFE_INTEGER
    ) {
      return { modifiedCount: 0 };
    }
    document.balanceCents += update.$inc.balanceCents;
    return { modifiedCount: 1 };
  }
}

class MemoryDatabase {
  collections = new Map();

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MemoryCollection());
    }
    return this.collections.get(name);
  }
}

const db = new MemoryDatabase();
const server = createApiApp({
  db,
  adminPassword: 'admin-password-123',
  isProduction: false
}).listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const apiUrl = `http://127.0.0.1:${server.address().port}`;

after(() => new Promise((resolve) => server.close(resolve)));

const postJson = (path, body, headers = {}) =>
  fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });

const cookieFrom = (response) => response.headers.get('set-cookie').split(';')[0];

test('registration persists a salted password hash and creates a session', async () => {
  const response = await postJson('/api/auth/register', {
    firstName: 'New',
    lastName: 'User',
    email: 'NEW@example.com',
    password: 'pass1234'
  });
  const body = await response.json();
  const storedUser = db.collection('users').documents[0];

  assert.equal(response.status, 201);
  assert.equal(body.user.email, 'new@example.com');
  assert.equal(body.user.firstName, 'New');
  assert.equal(body.user.lastName, 'User');
  assert.equal(body.user.balanceCents, 0);
  assert.equal(typeof body.user.createdAt, 'string');
  assert.equal('password' in body.user, false);
  assert.notEqual(storedUser.passwordHash, 'pass1234');
  assert.equal(storedUser.passwordSalt.length, 32);
  assert.equal(storedUser.balanceCents, 0);
  assert.equal(storedUser.role, 'user');
  assert.equal(db.collection('sessions').documents.length, 1);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
});

test('duplicate email registration and unprovisioned admin registration are rejected', async () => {
  const duplicate = await postJson('/api/auth/register', {
    firstName: 'Another',
    lastName: 'User',
    email: 'new@example.com',
    password: 'secure-password-456'
  });
  const admin = await postJson('/api/auth/register', {
    firstName: 'Admin',
    lastName: 'Account',
    email: ADMIN_EMAIL,
    password: 'secure-password-456'
  });

  assert.equal(duplicate.status, 409);
  assert.equal(admin.status, 403);
});

test('admin can fetch all database users, but unauthenticated and regular users cannot', async () => {
  const regularCookie = cookieFrom(
    await postJson('/api/auth/login', {
      email: 'new@example.com',
      password: 'pass1234'
    })
  );
  const unauthenticatedResponse = await fetch(`${apiUrl}/api/users`);
  const regularResponse = await fetch(`${apiUrl}/api/users`, {
    headers: { Cookie: regularCookie }
  });
  const regularUser = db.collection('users').documents.find(
    (user) => user.email === 'new@example.com'
  );
  regularUser.balanceCents = 2000;
  const withdraw = await postJson(
    `/api/users/${regularUser._id}/balance`,
    { changeInCents: -1000 },
    { Cookie: regularCookie }
  );
  const creditAttempt = await postJson(
    `/api/users/${regularUser._id}/balance`,
    { changeInCents: 1000 },
    { Cookie: regularCookie }
  );

  const adminPassword = 'admin-password-123';
  const admin = {
    _id: new ObjectId(),
    email: ADMIN_EMAIL,
    firstName: 'Site',
    lastName: 'Admin',
    createdAt: new Date(),
    balanceCents: 0,
    role: 'admin',
    ...await createPasswordRecord(adminPassword)
  };
  db.collection('users').documents.push(admin);
  const adminLogin = await postJson('/api/auth/login', {
    email: admin.email,
    password: adminPassword
  });
  const adminLoginBody = await adminLogin.clone().json();
  const adminCookie = cookieFrom(adminLogin);
  const rejectedAdminLogin = await postJson('/api/auth/login', {
    email: admin.email,
    password: 'incorrect-admin-password'
  });
  const adminResponse = await fetch(`${apiUrl}/api/users`, {
    headers: { Cookie: adminCookie }
  });
  const result = await adminResponse.json();

  assert.equal(unauthenticatedResponse.status, 401);
  assert.equal(regularResponse.status, 403);
  assert.equal(withdraw.status, 200);
  assert.equal((await withdraw.json()).user.balanceCents, 1000);
  assert.equal(creditAttempt.status, 403);
  assert.equal(adminResponse.status, 200);
  assert.equal(adminLoginBody.isAdmin, true);
  assert.equal(rejectedAdminLogin.status, 401);
  assert.equal(result.users.length, 2);
  assert.deepEqual(result.users.map((user) => user.email).sort(), [
    ADMIN_EMAIL,
    'new@example.com'
  ]);
  assert.equal('passwordHash' in result.users[0], false);
  assert.equal('passwordSalt' in result.users[0], false);
});

test('an admin role on another email does not grant administrator access', async () => {
  const password = 'admin-password-123';
  const impostor = {
    _id: new ObjectId(),
    email: 'impostor@example.com',
    firstName: 'Not',
    lastName: 'Admin',
    createdAt: new Date(),
    balanceCents: 0,
    role: 'admin',
    ...await createPasswordRecord(password)
  };
  db.collection('users').documents.push(impostor);

  const login = await postJson('/api/auth/login', {
    email: impostor.email,
    password
  });
  const loginBody = await login.json();
  const usersResponse = await fetch(`${apiUrl}/api/users`, {
    headers: { Cookie: cookieFrom(login) }
  });

  assert.equal(login.status, 200);
  assert.equal(loginBody.isAdmin, false);
  assert.equal(usersResponse.status, 403);
});

test('registration rejects an empty password before saving', async () => {
  const response = await postJson('/api/auth/register', {
    firstName: 'Weak',
    lastName: 'Password',
    email: 'weak@example.com',
    password: ''
  });

  assert.equal(response.status, 400);
  assert.equal(db.collection('users').documents.some((user) => user.email === 'weak@example.com'), false);
});
