import { randomBytes, scrypt as scryptCallback, createHash, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { ObjectId } from 'mongodb';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = 'dollarcraft_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_BALANCE_CENTS = Number.MAX_SAFE_INTEGER;
const ADMIN_EMAIL = 'dollarcraft3@gmail.com';

const HttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const hashSessionToken = (token) =>
  createHash('sha256').update(token).digest('hex');

const readSessionToken = (req) => {
  const cookies = req.headers.cookie?.split(';') || [];
  const sessionCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${SESSION_COOKIE}=`)
  );
  const token = sessionCookie?.trim().slice(SESSION_COOKIE.length + 1);
  return token && /^[A-Za-z0-9_-]{40,50}$/.test(token) ? token : null;
};

const setSessionCookie = (res, token, secure) => {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DURATION_MS / 1000}${secure ? '; Secure' : ''}`
  );
};

const clearSessionCookie = (res, secure) => {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`
  );
};

const hashPassword = async (password, salt) => {
  const derivedKey = await scrypt(password, salt, 64, {
    N: 32_768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  });
  return derivedKey.toString('hex');
};

const verifyPassword = async (password, salt, expectedHash) => {
  const actualHash = Buffer.from(await hashPassword(password, salt), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actualHash.length === expected.length && timingSafeEqual(actualHash, expected);
};

export const createPasswordRecord = async (password) => {
  const salt = randomBytes(16).toString('hex');
  return { passwordSalt: salt, passwordHash: await hashPassword(password, salt) };
};

const publicProfile = (user) => ({
  id: String(user._id),
  firstName: user.firstName,
  lastName: user.lastName,
  name: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  createdAt: user.createdAt,
  balanceCents: user.balanceCents
});

const authResult = (user) => ({
  user: publicProfile(user),
  isAdmin: user.role === 'admin'
});

const normalizeEmail = (email) => email.trim().toLowerCase();

const validateRegistration = (body) => {
  const { email, firstName, lastName, password } = body || {};
  if (
    typeof email !== 'string' ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof firstName !== 'string' ||
    !firstName.trim() ||
    firstName.trim().length > 100 ||
    typeof lastName !== 'string' ||
    !lastName.trim() ||
    lastName.trim().length > 100 ||
    typeof password !== 'string' ||
    password.length < 12 ||
    password.length > 128 ||
    Buffer.byteLength(password, 'utf8') > 512
  ) {
    throw new HttpError(400, 'Enter valid names and email, and a password of 12 to 128 characters.');
  }
  return {
    email: normalizeEmail(email),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    password
  };
};

const sessionAccount = async (req, db) => {
  const token = readSessionToken(req);
  if (!token) return null;

  const session = await db.collection('sessions').findOne({
    tokenHash: hashSessionToken(token),
    expiresAt: { $gt: new Date() }
  });
  if (!session) return null;

  const user = await db.collection('users').findOne({ _id: session.userId });
  return user ? { user, tokenHash: session.tokenHash } : null;
};

export const createApiApp = ({
  db,
  adminEmail = process.env.ADMIN_EMAIL || ADMIN_EMAIL,
  isProduction = process.env.NODE_ENV === 'production'
}) => {
  if (!db) throw new Error('A MongoDB database connection is required.');

  const app = express();
  const normalizedAdminEmail = normalizeEmail(adminEmail);
  app.disable('x-powered-by');
  app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '16kb' }));

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many sign-in attempts. Please try again later.' }
  });
  const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many registration attempts. Please try again later.' }
  });

  const requireAccount = asyncHandler(async (req, res, next) => {
    req.account = await sessionAccount(req, db);
    if (!req.account) throw new HttpError(401, 'Please sign in to continue.');
    next();
  });

  const requireAdmin = asyncHandler(async (req, res, next) => {
    if (req.account.user.role !== 'admin') {
      throw new HttpError(403, 'Administrator access is required.');
    }
    next();
  });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.post('/api/auth/register', registrationLimiter, asyncHandler(async (req, res) => {
    const { email, firstName, lastName, password } = validateRegistration(req.body);
    if (email === normalizedAdminEmail) {
      throw new HttpError(403, 'This administrator account must be provisioned by the site owner.');
    }

    const now = new Date();
    const user = {
      firstName,
      lastName,
      email,
      ...await createPasswordRecord(password),
      createdAt: now,
      balanceCents: 0,
      role: 'user'
    };
    try {
      const { insertedId } = await db.collection('users').insertOne(user);
      user._id = insertedId;
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpError(409, 'An account with this email already exists.');
      }
      throw error;
    }

    const token = randomBytes(32).toString('base64url');
    await db.collection('sessions').insertOne({
      tokenHash: hashSessionToken(token),
      userId: user._id,
      createdAt: now,
      expiresAt: new Date(now.getTime() + SESSION_DURATION_MS)
    });
    setSessionCookie(res, token, isProduction);
    res.status(201).json(authResult(user));
  }));

  app.post('/api/auth/login', loginLimiter, asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (
      typeof email !== 'string' ||
      email.length > 254 ||
      typeof password !== 'string' ||
      password.length > 128
    ) {
      throw new HttpError(400, 'Enter a valid email and password.');
    }

    const user = await db.collection('users').findOne({
      email: normalizeEmail(email)
    });
    const validPassword = user && await verifyPassword(
      password,
      user.passwordSalt,
      user.passwordHash
    );
    if (!validPassword) throw new HttpError(401, 'Incorrect email or password.');

    const now = new Date();
    const token = randomBytes(32).toString('base64url');
    await db.collection('sessions').insertOne({
      tokenHash: hashSessionToken(token),
      userId: user._id,
      createdAt: now,
      expiresAt: new Date(now.getTime() + SESSION_DURATION_MS)
    });
    setSessionCookie(res, token, isProduction);
    res.json(authResult(user));
  }));

  app.get('/api/auth/session', asyncHandler(async (req, res) => {
    const account = await sessionAccount(req, db);
    res.json(account ? authResult(account.user) : { user: null, isAdmin: false });
  }));

  app.post('/api/auth/logout', asyncHandler(async (req, res) => {
    const token = readSessionToken(req);
    if (token) {
      await db.collection('sessions').deleteOne({
        tokenHash: hashSessionToken(token)
      });
    }
    clearSessionCookie(res, isProduction);
    res.status(204).end();
  }));

  app.get('/api/users', requireAccount, requireAdmin, asyncHandler(async (_req, res) => {
    const users = await db.collection('users')
      .find({}, { projection: { passwordHash: 0, passwordSalt: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ users: users.map(publicProfile) });
  }));

  app.post(
    '/api/users/:userId/balance',
    requireAccount,
    asyncHandler(async (req, res) => {
      const changeInCents = req.body?.changeInCents;
      if (!Number.isSafeInteger(changeInCents) || changeInCents === 0) {
        throw new HttpError(400, 'The wallet change must be a non-zero whole number of cents.');
      }
      if (changeInCents < 0 && changeInCents > -1000) {
        throw new HttpError(400, 'Minimum withdrawal amount is $10 USD.');
      }
      if (changeInCents < 0 && String(req.account.user._id) !== req.params.userId) {
        throw new HttpError(403, 'You can only withdraw from your own wallet.');
      }
      if (changeInCents > 0 && req.account.user.role !== 'admin') {
        throw new HttpError(403, 'Administrator access is required to credit wallets.');
      }

      if (!ObjectId.isValid(req.params.userId)) {
        throw new HttpError(404, 'User account not found.');
      }
      const targetId = new ObjectId(req.params.userId);
      const target = await db.collection('users').findOne({ _id: targetId });
      if (!target) throw new HttpError(404, 'User account not found.');

      const filter = { _id: targetId };
      if (changeInCents < 0) {
        filter.balanceCents = { $gte: -changeInCents };
      } else {
        filter.$expr = {
          $lte: [{ $add: ['$balanceCents', changeInCents] }, MAX_BALANCE_CENTS]
        };
      }
      const update = await db.collection('users').updateOne(filter, {
        $inc: { balanceCents: changeInCents }
      });
      if (update.modifiedCount !== 1) {
        throw new HttpError(409, 'The wallet balance is insufficient or too large.');
      }

      const updatedUser = await db.collection('users').findOne({ _id: target._id });
      res.json({ user: publicProfile(updatedUser) });
    })
  );

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.resolve(currentDir, '..', 'dist');
  if (isProduction && existsSync(path.join(distPath, 'index.html'))) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'API route not found.')));
  app.use((error, _req, res, _next) => {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('API request failed.', error);
    return res.status(500).json({ error: 'The account service could not complete the request.' });
  });

  return app;
};
