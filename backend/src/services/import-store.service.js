import { nanoid } from 'nanoid';
import { env } from '../config/env.js';

const TTL_MS = env.IMPORT_CACHE_TTL_MIN * 60 * 1000;

/** @type {Map<string, { columns: string[], rows: any[], createdAt: number, fileName: string }>} */
const store = new Map();

function evictExpired() {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (now - entry.createdAt > TTL_MS) store.delete(id);
  }
}

setInterval(evictExpired, 60 * 1000).unref?.();

export const importStore = {
  create({ columns, rows, fileName }) {
    const id = `imp_${nanoid(12)}`;
    store.set(id, { columns, rows, fileName, createdAt: Date.now() });
    return id;
  },
  get(id) {
    evictExpired();
    return store.get(id) ?? null;
  },
  delete(id) {
    store.delete(id);
  },
  size() {
    return store.size;
  },
};
