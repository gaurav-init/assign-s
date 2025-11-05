import { CrmRecordSchema, CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from '../schemas/crm.schema.js';

/**
 * Server-side belt-and-suspenders validation of each AI-extracted record.
 * - Enforces enum whitelists.
 * - Ensures `created_at` is Date-parseable.
 * - Normalizes country codes and phone numbers.
 * - Applies the "must have email OR mobile" skip rule.
 * - Escapes embedded newlines in string fields.
 *
 * @param {any} rec raw record from the LLM
 * @param {Record<string, any>} [raw] original CSV row (for skip payload)
 * @returns {{ ok: true, record: any } | { ok: false, reason: string }}
 */
export function validateRecord(rec, raw) {
  const parsed = CrmRecordSchema.safeParse(rec);
  if (!parsed.success) {
    return { ok: false, reason: `schema: ${parsed.error.issues[0]?.message ?? 'invalid'}` };
  }
  const r = { ...parsed.data };

  // created_at must be Date-parseable
  if (r.created_at) {
    const d = new Date(r.created_at);
    if (Number.isNaN(d.getTime())) {
      r.created_at = null;
    } else {
      r.created_at = d.toISOString();
    }
  }

  // country_code normalization → leading '+'
  if (r.country_code) {
    const cc = String(r.country_code).trim().replace(/[^\d+]/g, '');
    r.country_code = cc ? (cc.startsWith('+') ? cc : `+${cc}`) : null;
  }

  // mobile_without_country_code → digits only
  if (r.mobile_without_country_code) {
    const m = String(r.mobile_without_country_code).replace(/\D/g, '');
    r.mobile_without_country_code = m || null;
  }

  // enum guardrails (Zod schema already coerces but be defensive)
  if (r.crm_status && !CRM_STATUS_VALUES.includes(r.crm_status)) r.crm_status = null;
  if (r.data_source && !DATA_SOURCE_VALUES.includes(r.data_source)) r.data_source = '';

  // Escape stray newlines in text fields so downstream CSV export stays valid.
  for (const key of ['name', 'company', 'crm_note', 'description', 'possession_time']) {
    if (typeof r[key] === 'string' && r[key].includes('\n')) {
      r[key] = r[key].replace(/\r?\n/g, '\\n');
    }
  }

  // Skip rule: no contact → skip
  const hasEmail = !!(r.email && String(r.email).trim());
  const hasMobile = !!(r.mobile_without_country_code && String(r.mobile_without_country_code).trim());
  if (!hasEmail && !hasMobile) {
    return { ok: false, reason: 'no email or mobile number' };
  }

  return { ok: true, record: r };
}
