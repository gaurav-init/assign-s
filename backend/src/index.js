import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`GrowEasy CSV Importer API listening on :${env.PORT}`, {
    env: env.NODE_ENV,
    provider: env.AI_PROVIDER,
    frontendOrigin: env.FRONTEND_ORIGIN,
  });
});

function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.error('unhandledRejection', { message: err?.message, stack: err?.stack });
});
