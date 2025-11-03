import { env } from '../../config/env.js';
import { extractBatchOpenAi } from './openai.provider.js';
import { extractBatchGemini } from './gemini.provider.js';
import { extractBatchMock } from './mock.provider.js';

/**
 * Provider-agnostic entry point. Dispatches to whichever LLM is configured.
 * @param {Array<Record<string, any>>} rows
 * @returns {Promise<{ extracted: any[], skipped: any[] }>}
 */
export async function extractBatch(rows) {
  switch (env.AI_PROVIDER) {
    case 'openai':
      return extractBatchOpenAi(rows);
    case 'gemini':
      return extractBatchGemini(rows);
    case 'mock':
      return extractBatchMock(rows);
    default:
      throw new Error(`Unknown AI_PROVIDER: ${env.AI_PROVIDER}`);
  }
}
