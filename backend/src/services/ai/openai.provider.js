import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt.js';
import { openAiJsonSchema } from '../../schemas/crm.schema.js';
import { withTimeout } from '../../utils/retry.js';
import { Errors } from '../../utils/errors.js';

let client = null;

function getClient() {
  if (!client) {
    if (!env.OPENAI_API_KEY) {
      throw Errors.aiUpstream('OPENAI_API_KEY not configured');
    }
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}

/**
 * Extract a single batch via OpenAI's structured-output JSON schema mode.
 * @param {Array<Record<string, any>>} rows
 * @returns {Promise<{ extracted: any[], skipped: any[] }>}
 */
export async function extractBatchOpenAi(rows) {
  const c = getClient();

  const call = c.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(rows) },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: openAiJsonSchema,
    },
  });

  const completion = await withTimeout(call, env.AI_TIMEOUT_MS, 'openai.chat.completions');

  const raw = completion.choices?.[0]?.message?.content;
  if (!raw) throw Errors.aiUpstream('Empty response from OpenAI');

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw Errors.aiUpstream(`Malformed JSON from OpenAI: ${err.message}`);
  }
}
