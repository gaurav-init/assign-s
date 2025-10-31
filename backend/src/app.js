import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import router from './routes/index.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN === '*' ? true : env.FRONTEND_ORIGIN.split(','),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(requestIdMiddleware);
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('tiny'));
  }

  app.get('/', (_req, res) => {
    res.json({ name: 'GrowEasy CSV Importer API', version: '1.0.0', docs: '/api/v1/health' });
  });

  app.use('/api/v1', router);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
