import { Router } from 'express';
import { env } from '../config/env.js';
import { getDb } from '../services/mongo.service.js';

const router = Router();

router.get('/', async (_req, res) => {
  const db = await getDb();
  res.json({
    status: 'ok',
    uptimeSec: Math.round(process.uptime()),
    provider: env.AI_PROVIDER,
    model:
      env.AI_PROVIDER === 'openai'
        ? env.OPENAI_MODEL
        : env.AI_PROVIDER === 'gemini'
          ? env.GEMINI_MODEL
          : 'mock',
    persistence: db ? { enabled: true, db: env.MONGODB_DB } : { enabled: false },
    version: '1.0.0',
  });
});

export default router;
