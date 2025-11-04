/**
 * Retry an async function with exponential backoff.
 * @param {() => Promise<T>} fn
 * @param {{ retries?: number, baseMs?: number, factor?: number, onRetry?: (err: Error, attempt: number) => void }} [opts]
 * @template T
 * @returns {Promise<T>}
 */
export async function retry(fn, opts = {}) {
  const { retries = 2, baseMs = 500, factor = 3, onRetry } = opts;
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      const delay = baseMs * Math.pow(factor, attempt);
      if (onRetry) onRetry(err, attempt + 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

/**
 * Wrap a promise with a timeout.
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {string} [label]
 * @template T
 * @returns {Promise<T>}
 */
export function withTimeout(promise, ms, label = 'operation') {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}
