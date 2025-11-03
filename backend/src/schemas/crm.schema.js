import { z } from 'zod';

export const CRM_STATUS_VALUES = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
];

export const DATA_SOURCE_VALUES = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
];

export const CRM_FIELDS = [
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
];

const nullableStr = z.union([z.string(), z.null()]).transform((v) => (v === '' ? null : v));

export const CrmRecordSchema = z.object({
  created_at: nullableStr.nullable(),
  name: nullableStr.nullable(),
  email: nullableStr.nullable(),
  country_code: nullableStr.nullable(),
  mobile_without_country_code: nullableStr.nullable(),
  company: nullableStr.nullable(),
  city: nullableStr.nullable(),
  state: nullableStr.nullable(),
  country: nullableStr.nullable(),
  lead_owner: nullableStr.nullable(),
  crm_status: z
    .union([z.enum(CRM_STATUS_VALUES), z.string(), z.null()])
    .transform((v) => (v && CRM_STATUS_VALUES.includes(v) ? v : null)),
  crm_note: nullableStr.nullable(),
  data_source: z
    .union([z.enum(DATA_SOURCE_VALUES), z.string(), z.null()])
    .transform((v) => (v && DATA_SOURCE_VALUES.includes(v) ? v : '')),
  // note: null / unknown values are coerced to "" per the assignment spec.
  possession_time: nullableStr.nullable(),
  description: nullableStr.nullable(),
});

export const SkippedRecordSchema = z.object({
  rowIndex: z.number().int().nonnegative(),
  reason: z.string(),
  raw: z.record(z.any()).optional(),
});

export const AiBatchResponseSchema = z.object({
  extracted: z.array(
    CrmRecordSchema.extend({
      _rowIndex: z.number().int().nonnegative().optional(),
    })
  ),
  skipped: z
    .array(
      z.object({
        rowIndex: z.number().int().nonnegative(),
        reason: z.string(),
      })
    )
    .default([]),
});

/**
 * JSON Schema (for OpenAI structured outputs) mirroring the same contract.
 * Kept in sync with CrmRecordSchema.
 */
export const openAiJsonSchema = {
  name: 'crm_batch_extraction',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['extracted', 'skipped'],
    properties: {
      extracted: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
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
          properties: {
            _rowIndex: { type: 'integer', minimum: 0 },
            created_at: { type: ['string', 'null'] },
            name: { type: ['string', 'null'] },
            email: { type: ['string', 'null'] },
            country_code: { type: ['string', 'null'] },
            mobile_without_country_code: { type: ['string', 'null'] },
            company: { type: ['string', 'null'] },
            city: { type: ['string', 'null'] },
            state: { type: ['string', 'null'] },
            country: { type: ['string', 'null'] },
            lead_owner: { type: ['string', 'null'] },
            crm_status: {
              type: ['string', 'null'],
              enum: [...CRM_STATUS_VALUES, null],
            },
            crm_note: { type: ['string', 'null'] },
            data_source: {
              type: 'string',
              enum: [...DATA_SOURCE_VALUES, ''],
            },
            possession_time: { type: ['string', 'null'] },
            description: { type: ['string', 'null'] },
          },
        },
      },
      skipped: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['rowIndex', 'reason'],
          properties: {
            rowIndex: { type: 'integer', minimum: 0 },
            reason: { type: 'string' },
          },
        },
      },
    },
  },
};
