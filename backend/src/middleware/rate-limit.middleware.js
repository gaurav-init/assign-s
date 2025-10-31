const WINDOW_MS = 60 * 1000;
const MAX_HITS = 30;

/** @type {Map<string, { count: number, resetAt: number }>} */
const buckets = new Map();

export function rateLimit(req, res, next) {
  const key = req.ip || 'anon';
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  bucket.count += 1;
  if (bucket.count > MAX_HITS) {
    res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
    return res.status(429).json({
      error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' },
    });
  }
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
}, WINDOW_MS).unref?.();
