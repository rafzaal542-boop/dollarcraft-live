import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { createApiApp } from './app.js';

const start = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured before starting the account service.');
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000
  });
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'dollarcraft');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ tokenHash: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    const app = createApiApp({ db });
    const port = Number(process.env.PORT || 3001);
    const server = app.listen(port, () => {
      console.log(`Dollar Craft account service listening on port ${port}.`);
    });

    const shutdown = () => {
      server.close(() => {
        client.close().then(() => process.exit(0));
      });
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch (error) {
    await client.close();
    throw error;
  }
};

start().catch((error) => {
  console.error('Unable to start the account service.', error);
  process.exitCode = 1;
});
