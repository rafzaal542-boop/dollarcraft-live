import { randomBytes, randomUUID, scrypt, scryptSync, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const scryptAsync = promisify(scrypt);
const ADMIN_EMAIL = 'dollarcraft3@gmail.com';
const SESSION_COOKIE = 'dollarcraft_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_HASH_BYTES = 64;
const MAX_REQUEST_BYTES = 16 * 1024;
const DEFAULT_DATA_DIR = fileURLToPath(new URL('./data/', import.meta.url));

const json = (response, statusCode, payload, headers = {}) => {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  response.end(JSON.stringify(payload));
};

const readJsonBody = async (request) => {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_REQUEST_BYTES) {
      throw Object.assign(new Error('Request body is too large.'), { statusCode: 413 });
    }
  }
  try {
    return body ? JSON.parse(body) : {};
  } catch {
    throw Object.assign(new Error('Request body must be valid JSON.'), { statusCode: 400 });
  }
};

const passwordHash = (password, salt) =>
  scryptAsync(password, salt, PASSWORD_HASH_BYTES);

const publicProfile = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  name: user.name,
  createdAt: user.createdAt,
  balanceCents: user.balanceCents
});

const getCookie = (request, name) => {
  const cookieHeader = request.headers.cookie || '';
  const entry = cookieHeader.split(';').map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : '';
};

export function createApiServer({
  dataDir = process.env.USER_DATA_DIR || DEFAULT_DATA_DIR,
  adminPassword = process.env.ADMIN_PASSWORD || ''
} = {}) {
  const usersPath = path.join(dataDir, 'users.json');
  const sessions = new Map();
  const streams = new Set();
  const adminPasswordDigest = adminPassword
    ? scryptSync(adminPassword, `dollarcraft-admin:${ADMIN_EMAIL}`, PASSWORD_HASH_BYTES)
    : null;
  let writeQueue = Promise.resolve();

  const readUsers = async () => {
    try {
      const contents = await fs.readFile(usersPath, 'utf8');
      const users = JSON.parse(contents);
      if (!Array.isArray(users)) {
        throw new Error('The user database must contain a JSON array.');
      }
      return users;
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  };

  const saveUsers = async (users) => {
    await fs.mkdir(dataDir, { recursive: true });
    const temporaryPath = `${usersPath}.${randomUUID()}.tmp`;
    const file = await fs.open(temporaryPath, 'wx', 0o600);
    try {
      await file.writeFile(JSON.stringify(users), 'utf8');
      await file.sync();
    } finally {
      await file.close();
    }
    await fs.rename(temporaryPath, usersPath);
  };

  const updateUsers = async (update) => {
    const operation = writeQueue.then(async () => {
      const users = await readUsers();
      const result = await update(users);
      if (result?.save) await saveUsers(users);
      return result?.value;
    });
    writeQueue = operation.catch(() => {});
    return operation;
  };

  const getSession = (request) => {
    const token = getCookie(request, SESSION_COOKIE);
    const session = sessions.get(token);
    if (!session || session.expiresAt <= Date.now()) {
      if (token) sessions.delete(token);
      return null;
    }
    return { token, session };
  };

  const sessionCookie = (token, secure) =>
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure ? '; Secure' : ''}`;

  const startStream = async (response, session, userId = '') => {
    response.writeHead(200, {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-Accel-Buffering': 'no',
      'X-Content-Type-Options': 'nosniff'
    });
    response.write('retry: 3000\n\n');
    const stream = { response, isAdmin: session.isAdmin, userId };
    streams.add(stream);
    response.on('close', () => streams.delete(stream));

    const users = await readUsers();
    const initialData = session.isAdmin
      ? users.map(publicProfile)
      : users.filter((user) => user.id === session.userId).map(publicProfile);
    response.write(`data: ${JSON.stringify(initialData)}\n\n`);
  };

  const publishUsers = (users) => {
    for (const stream of streams) {
      const visibleUsers = stream.isAdmin
        ? users
        : users.filter((user) => user.id === stream.userId);
      if (!stream.response.destroyed) {
        stream.response.write(`data: ${JSON.stringify(visibleUsers.map(publicProfile))}\n\n`);
      }
    }
  };

  const handler = async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    const secure = request.headers['x-forwarded-proto'] === 'https';
    const auth = getSession(request);
    const session = auth?.session;

    if (request.method === 'GET' && url.pathname === '/api/me') {
      if (!session) return json(response, 401, { error: 'Please sign in.' });
      if (session.isAdmin) {
        return json(response, 200, {
          user: { id: session.userId, email: ADMIN_EMAIL, firstName: 'Admin', lastName: '' },
          isAdmin: true
        });
      }
      const users = await readUsers();
      const user = users.find((item) => item.id === session.userId);
      if (!user) return json(response, 401, { error: 'This account no longer exists.' });
      return json(response, 200, { user: publicProfile(user), isAdmin: false });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/register') {
      const body = await readJsonBody(request);
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
      const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          !firstName || firstName.length > 100 ||
          !lastName || lastName.length > 100 ||
          password.length < 8 || password.length > 1024) {
        return json(response, 400, { error: 'Enter a valid email, both names, and a password of at least 8 characters.' });
      }
      if (email === ADMIN_EMAIL) {
        return json(response, 403, { error: 'The administrator account cannot be registered here.' });
      }

      const salt = randomBytes(PASSWORD_SALT_BYTES).toString('hex');
      const hash = (await passwordHash(password, salt)).toString('hex');
      const user = {
        id: randomUUID(),
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        createdAt: new Date().toISOString(),
        balanceCents: 0,
        passwordSalt: salt,
        passwordHash: hash
      };
      const createdUser = await updateUsers((users) => {
        if (users.some((item) => item.email.toLowerCase() === email)) {
          return { save: false, value: null };
        }
        users.push(user);
        return { save: true, value: publicProfile(user) };
      });
      if (!createdUser) return json(response, 409, { error: 'An account with this email already exists.' });

      const token = randomBytes(32).toString('base64url');
      sessions.set(token, {
        userId: user.id,
        isAdmin: false,
        expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000
      });
      publishUsers(await readUsers());
      return json(response, 201, { user: createdUser, isAdmin: false }, {
        'Set-Cookie': sessionCookie(token, secure)
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readJsonBody(request);
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      if (!email || !password) {
        return json(response, 400, { error: 'Enter your email and password.' });
      }

      let authenticatedSession;
      if (email === ADMIN_EMAIL) {
        if (!adminPasswordDigest) {
          return json(response, 503, { error: 'Admin login is not configured. Set ADMIN_PASSWORD on the server.' });
        }
        const submittedDigest = await passwordHash(password, `dollarcraft-admin:${ADMIN_EMAIL}`);
        if (!timingSafeEqual(adminPasswordDigest, submittedDigest)) {
          return json(response, 401, { error: 'Incorrect email or password.' });
        }
        authenticatedSession = {
          userId: 'admin',
          isAdmin: true,
          expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000
        };
      } else {
        const users = await readUsers();
        const user = users.find((item) => item.email.toLowerCase() === email);
        if (!user) return json(response, 401, { error: 'Incorrect email or password.' });
        const submittedDigest = await passwordHash(password, user.passwordSalt);
        const storedDigest = Buffer.from(user.passwordHash, 'hex');
        if (storedDigest.length !== submittedDigest.length ||
            !timingSafeEqual(storedDigest, submittedDigest)) {
          return json(response, 401, { error: 'Incorrect email or password.' });
        }
        authenticatedSession = {
          userId: user.id,
          isAdmin: false,
          expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000
        };
      }

      const token = randomBytes(32).toString('base64url');
      sessions.set(token, authenticatedSession);
      return json(response, 200, {
        user: authenticatedSession.isAdmin
          ? { id: 'admin', email: ADMIN_EMAIL, firstName: 'Admin', lastName: '' }
          : publicProfile((await readUsers()).find((user) => user.id === authenticatedSession.userId)),
        isAdmin: authenticatedSession.isAdmin
      }, { 'Set-Cookie': sessionCookie(token, secure) });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
      if (auth) sessions.delete(auth.token);
      return json(response, 200, { ok: true }, {
        'Set-Cookie': `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure ? '; Secure' : ''}`
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/users/events') {
      if (!session?.isAdmin) return json(response, 403, { error: 'Admin access required.' });
      return startStream(response, session);
    }

    const profileEventsMatch = url.pathname.match(/^\/api\/users\/([^/]+)\/events$/);
    if (request.method === 'GET' && profileEventsMatch) {
      const requestedUserId = decodeURIComponent(profileEventsMatch[1]);
      if (!session || (!session.isAdmin && session.userId !== requestedUserId)) {
        return json(response, 403, { error: 'Access denied.' });
      }
      return startStream(response, session, requestedUserId);
    }

    if (request.method === 'POST' && url.pathname === '/api/wallet/change') {
      if (!session) return json(response, 401, { error: 'Please sign in.' });
      const body = await readJsonBody(request);
      const userId = typeof body.userId === 'string' ? body.userId : '';
      const changeInCents = body.changeInCents;
      if (!userId || !Number.isSafeInteger(changeInCents) || changeInCents === 0) {
        return json(response, 400, { error: 'A user and a non-zero whole-cent change are required.' });
      }
      if (!session.isAdmin && (userId !== session.userId || changeInCents > 0)) {
        return json(response, 403, { error: 'Users may only withdraw from their own wallet.' });
      }

      try {
        const changedUser = await updateUsers((users) => {
          const user = users.find((item) => item.id === userId);
          if (!user) throw Object.assign(new Error('User account not found.'), { statusCode: 404 });
          const nextBalance = user.balanceCents + changeInCents;
          if (!Number.isSafeInteger(nextBalance) || nextBalance < 0) {
            throw Object.assign(new Error('The wallet balance is insufficient or too large.'), { statusCode: 400 });
          }
          user.balanceCents = nextBalance;
          return { save: true, value: publicProfile(user) };
        });
        publishUsers(await readUsers());
        return json(response, 200, { user: changedUser });
      } catch (error) {
        if (error.statusCode) return json(response, error.statusCode, { error: error.message });
        throw error;
      }
    }

    return json(response, 404, { error: 'Not found.' });
  };

  return http.createServer((request, response) => {
    handler(request, response).catch((error) => {
      console.error('API request failed:', error);
      if (!response.headersSent) {
        json(response, error.statusCode || 500, {
          error: error.statusCode ? error.message : 'The server could not complete the request.'
        });
      } else {
        response.destroy(error);
      }
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createApiServer();
  const port = Number(process.env.PORT || 3001);
  const host = process.env.HOST || '0.0.0.0';
  server.listen(port, host, () => {
    console.log(`Dollar Craft API listening on ${host}:${port}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.warn('Admin login is disabled until ADMIN_PASSWORD is configured in the server environment.');
    }
  });
}
