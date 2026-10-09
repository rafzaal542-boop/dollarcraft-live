import { MongoClient } from 'mongodb';

const repositoryError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

export const connectMongoUserRepository = async ({
  uri = process.env.MONGODB_URI,
  databaseName = process.env.MONGODB_DB_NAME || 'dollarcraft',
  collectionName = 'users'
} = {}) => {
  if (!uri) {
    throw new Error('MONGODB_URI must be configured before starting the API server.');
  }

  const client = new MongoClient(uri, {
    appName: 'dollar-craft-api',
    maxPoolSize: 20,
    retryWrites: true
  });
  let collection;
  try {
    await client.connect();
    collection = client.db(databaseName).collection(collectionName);
    await collection.createIndex({ email: 1 }, { unique: true, name: 'unique_user_email' });
  } catch (error) {
    await client.close();
    throw error;
  }

  const subscribers = new Set();
  let changeStream;
  let watcherPromise;
  const beginWatching = () => {
    if (watcherPromise) return;
    changeStream = collection.watch([], { fullDocument: 'updateLookup' });
    watcherPromise = (async () => {
      for await (const change of changeStream) {
        if (change.fullDocument) {
          for (const subscriber of subscribers) subscriber(change.fullDocument);
        }
      }
    })().catch((error) => {
      console.error('MongoDB user change stream stopped.', error);
      watcherPromise = null;
      changeStream = null;
    });
  };

  return {
    async listUsers() {
      return collection.find({}).sort({ createdAt: -1 }).toArray();
    },

    findById(id) {
      return collection.findOne({ id });
    },

    findByEmail(email) {
      return collection.findOne({ email: email.toLowerCase() });
    },

    async createUser(user) {
      try {
        await collection.insertOne(user);
        return user;
      } catch (error) {
        if (error.code === 11000) {
          throw repositoryError('An account with this email already exists.', 409);
        }
        throw error;
      }
    },

    async changeBalance(id, changeInCents) {
      const balanceRange = changeInCents < 0
        ? { $gte: -changeInCents }
        : { $lte: Number.MAX_SAFE_INTEGER - changeInCents };
      const result = await collection.findOneAndUpdate(
        { id, balanceCents: balanceRange },
        { $inc: { balanceCents: changeInCents } },
        { returnDocument: 'after', includeResultMetadata: false }
      );
      if (result) return result;

      const user = await collection.findOne({ id }, { projection: { id: 1 } });
      if (!user) throw repositoryError('User account not found.', 404);
      throw repositoryError('The wallet balance is insufficient or too large.', 400);
    },

    subscribe(callback) {
      subscribers.add(callback);
      beginWatching();
      return () => subscribers.delete(callback);
    },

    async close() {
      if (changeStream) await changeStream.close();
      await client.close();
    }
  };
};
