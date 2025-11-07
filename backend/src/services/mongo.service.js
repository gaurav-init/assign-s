import { MongoClient } from 'mongodb';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let clientPromise = null;
let db = null;

/**
 * Lazy singleton — returns the shared Mongo `db` handle, or null if the app
 * is running without persistence (MONGODB_URI unset). Never throws to the
 * caller: if the connection fails we log and fall back to no-op mode.
 * @returns {Promise<import('mongodb').Db | null>}
 */
export async function getDb() {
  if (!env.MONGODB_URI) return null;
  if (db) return db;
  if (!clientPromise) {
    const client = new MongoClient(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    clientPromise = client
      .connect()
      .then(async (c) => {
        // Prefer explicit MONGODB_DB; otherwise fall back to the DB in the URI.
        db = env.MONGODB_DB ? c.db(env.MONGODB_DB) : c.db();
        await ensureIndexes(db);
        logger.info('mongo connected', { db: db.databaseName });
        return db;
      })
      .catch((err) => {
        logger.error('mongo connect failed — persistence disabled', { message: err.message });
        clientPromise = null;
        return null;
      });
  }
  return clientPromise;
}

async function ensureIndexes(d) {
  const col = d.collection('imports');
  await col.createIndex({ importId: 1 }, { unique: true });
  await col.createIndex({ createdAt: -1 });
}

export function importsCollection(d) {
  return d.collection('imports');
}
