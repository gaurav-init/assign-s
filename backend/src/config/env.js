import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8080),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),

  AI_PROVIDER: z.enum(['openai', 'gemini', 'mock']).default('gemini'),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-3.1-flash-lite'),

  BATCH_SIZE: z.coerce.number().int().positive().default(20),
  AI_CONCURRENCY: z.coerce.number().int().positive().default(3),
  AI_MAX_RETRIES: z.coerce.number().int().nonnegative().default(2),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(45000),

  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(10),
  IMPORT_CACHE_TTL_MIN: z.coerce.number().int().positive().default(15),

  MONGODB_URI: z.string().optional(),
  MONGODB_DB: z.string().default('groweasy_csv_importer'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

if (env.AI_PROVIDER === 'openai' && !env.OPENAI_API_KEY && env.NODE_ENV !== 'test') {
  console.warn(
    '[env] AI_PROVIDER=openai but OPENAI_API_KEY is missing — extraction requests will fail. Set AI_PROVIDER=mock to use the built-in stub.'
  );
}

if (env.AI_PROVIDER === 'gemini' && !env.GEMINI_API_KEY && env.NODE_ENV !== 'test') {
  console.warn('[env] AI_PROVIDER=gemini but GEMINI_API_KEY is missing.');
}
