import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
export function errorMiddleware(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: { code: 'FILE_TOO_LARGE', message: 'Uploaded file exceeds size limit' },
    });
  }

  logger.error('unhandled error', { message: err?.message, stack: err?.stack });
  return res.status(500).json({
    error: { code: 'INTERNAL', message: 'Internal server error' },
  });
}

export function notFoundMiddleware(req, res) {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `${req.method} ${req.originalUrl} not found` },
  });
}
