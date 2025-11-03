import { env } from '../../config/env.js';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt.js';
import { withTimeout } from '../../utils/retry.js';
import { Errors } from '../../utils/errors.js';
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from '../../schemas/crm.schema.js';

/**
 * Gemini's responseSchema uses an OpenAPI-subset. Nullable fields must use
 * `nullable: true` + a base type (Gemini does not support union `type: [x, null]`).
 */
const geminiResponseSchema = {
  type: 'OBJECT',
  properties: {
    extracted: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          _rowIndex: { type: 'INTEGER' },
          created_at: { type: 'STRING', nullable: true },
          name: { type: 'STRING', nullable: true },
          email: { type: 'STRING', nullable: true },
          country_code: { type: 'STRING', nullable: true },
          mobile_without_country_code: { type: 'STRING', nullable: true },
          company: { type: 'STRING', nullable: true },
          city: { type: 'STRING', nullable: true },
          state: { type: 'STRING', nullable: true },
          country: { type: 'STRING', nullable: true },
          lead_owner: { type: 'STRING', nullable: true },
          crm_status: {
            type: 'STRING',
            nullable: true,
            enum: [...CRM_STATUS_VALUES],
          },
          crm_note: { type: 'STRING', nullable: true },
          data_source: {
            type: 'STRING',
            nullable: true,
            enum: [...DATA_SOURCE_VALUES],
          },
          possession_time: { type: 'STRING', nullable: true },
          description: { type: 'STRING', nullable: true },
        },
        required: [
          '_rowIndex',
          'created_at',
          'name',
          'email',
          'country_code',
          'mobile_without_country_code',
          'company',
          'city',
          'state',
          'country',
          'lead_owner',
          'crm_status',
          'crm_note',
          'data_source',
          'possession_time',
          'description',
        ],
      },
    },
    skipped: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          rowIndex: { type: 'INTEGER' },
          reason: { type: 'STRING' },
        },
        required: ['rowIndex', 'reason'],
      },
    },
  },
  required: ['extracted', 'skipped'],
};

/**
 * Extract a single batch via Google Gemini's generateContent REST API.
 * Uses responseSchema for structured JSON output.
 * @param {Array<Record<string, any>>} rows
 * @returns {Promise<{ extracted: any[], skipped: any[] }>}
 */
export async function extractBatchGemini(rows) {
  if (!env.GEMINI_API_KEY) throw Errors.aiUpstream('GEMINI_API_KEY not configured');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: buildUserPrompt(rows) }] }],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: geminiResponseSchema,
    },
  };

  const call = fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const res = await withTimeout(call, env.AI_TIMEOUT_MS, 'gemini.generateContent');
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw Errors.aiUpstream(`Gemini ${res.status}: ${text.slice(0, 300)}`);
  }

  const payload = await res.json();
  const raw = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw Errors.aiUpstream('Empty response from Gemini');

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw Errors.aiUpstream(`Malformed JSON from Gemini: ${err.message}`);
  }
}
