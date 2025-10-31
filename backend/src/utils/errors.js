export class AppError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {number} status
   * @param {Record<string, unknown>} [details]
   */
  constructor(code, message, status = 400, details) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const Errors = {
  invalidFile: (msg = 'Invalid file') => new AppError('INVALID_FILE', msg, 400),
  invalidCsv: (msg = 'Invalid CSV', details) => new AppError('INVALID_CSV', msg, 400, details),
  importNotFound: (id) =>
    new AppError('IMPORT_NOT_FOUND', `Import ${id} not found or expired`, 404),
  aiUpstream: (msg = 'AI provider request failed', details) =>
    new AppError('AI_UPSTREAM_FAILED', msg, 502, details),
  rateLimited: () => new AppError('RATE_LIMITED', 'Too many requests', 429),
  internal: (msg = 'Internal server error') => new AppError('INTERNAL', msg, 500),
};
