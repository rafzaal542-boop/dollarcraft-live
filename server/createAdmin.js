import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { createPasswordRecord } from './app.js';

const createAdmin = async () => {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD to provision the admin account.');
  }
  if (ADMIN_PASSWORD.length < 12 || ADMIN_PASSWORD.length > 128) {
    throw new Error('ADMIN_PASSWORD must be between 12 and 128 characters.');
  }

  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  try {
    await client.connect();
    const users = client.db(process.env.MONGODB_DB || 'dollarcraft').collection('users');
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const passwordRecord = await createPasswordRecord(ADMIN_PASSWORD);
    const result = await users.updateOne(
      { email },
      {
        $setOnInsert: {
          email,
          firstName: 'Admin',
          lastName: 'Account',
          createdAt: new Date(),
          balanceCents: 0
        },
        $set: { ...passwordRecord, role: 'admin' }
      },
      { upsert: true }
    );
    console.log(result.upsertedCount ? 'Admin account created.' : 'Admin account credentials updated.');
  } finally {
    await client.close();
  }
};

createAdmin().catch((error) => {
  console.error('Unable to provision the admin account.', error);
  process.exitCode = 1;
});
