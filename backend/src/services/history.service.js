import { getDb, importsCollection } from './mongo.service.js';
import { logger } from '../utils/logger.js';

/**
 * Persist a record for a newly-parsed CSV. Safe no-op if Mongo isn't configured.
 * @param {{ importId: string, fileName: string, fileSize: number, columns: string[], rowCount: number }} entry
 */
export async function recordParse(entry) {
  try {
    const db = await getDb();
    if (!db) return;
    await importsCollection(db).insertOne({
      importId: entry.importId,
      fileName: entry.fileName,
      fileSize: entry.fileSize,
      sourceColumns: entry.columns,
      rowCount: entry.rowCount,
      status: 'parsed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (err) {
    logger.warn('history: recordParse failed', { message: err.message });
  }
}

/**
 * Save an extraction result — the imported records themselves are stored so
 * the History drawer can replay them without a re-run.
 * @param {string} importId
 * @param {{ imported: any[], skipped: any[], counts: any, batches: any }} result
 */
export async function recordExtract(importId, result) {
  try {
    const db = await getDb();
    if (!db) return;
    await importsCollection(db).updateOne(
      { importId },
      {
        $set: {
          status: 'done',
          counts: result.counts,
          batches: result.batches,
          imported: result.imported,
          skipped: result.skipped,
          extractedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  } catch (err) {
    logger.warn('history: recordExtract failed', { message: err.message });
  }
}

/**
 * Record a failure so the history entry doesn't hang in "parsed".
 */
export async function recordFailure(importId, message) {
  try {
    const db = await getDb();
    if (!db) return;
    await importsCollection(db).updateOne(
      { importId },
      { $set: { status: 'failed', error: message, updatedAt: new Date() } }
    );
  } catch (err) {
    logger.warn('history: recordFailure failed', { message: err.message });
  }
}

/**
 * @param {{ limit?: number, skip?: number }} opts
 * @returns {Promise<{ enabled: boolean, items: any[], total: number }>}
 */
export async function listHistory({ limit = 20, skip = 0 } = {}) {
  const db = await getDb();
  if (!db) return { enabled: false, items: [], total: 0 };

  const col = importsCollection(db);
  const [items, total] = await Promise.all([
    col
      .find(
        {},
        {
          projection: {
            _id: 0,
            imported: 0,
            skipped: 0,
            sourceColumns: 0,
          },
        }
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.min(limit, 100))
      .toArray(),
    col.countDocuments({}),
  ]);
  return { enabled: true, items, total };
}

/**
 * Fetch one import by importId, including the full imported/skipped payloads.
 * @param {string} importId
 * @returns {Promise<any | null>}
 */
export async function getHistoryEntry(importId) {
  const db = await getDb();
  if (!db) return null;
  return importsCollection(db).findOne({ importId }, { projection: { _id: 0 } });
}
