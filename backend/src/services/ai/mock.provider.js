import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from '../../schemas/crm.schema.js';

/**
 * Best-effort local mapper — used when AI_PROVIDER=mock. Not as smart as an
 * LLM but useful for local development without keys, and as a deterministic
 * baseline for unit tests.
 * @param {Array<Record<string, any>>} rows
 * @returns {Promise<{ extracted: any[], skipped: any[] }>}
 */
export async function extractBatchMock(rows) {
  const extracted = [];
  const skipped = [];

  for (const row of rows) {
    const idx = row._rowIndex ?? 0;
    const record = mapRow(row);
    const hasEmail = !!(record.email && record.email.trim());
    const hasMobile = !!(record.mobile_without_country_code && record.mobile_without_country_code.trim());
    if (!hasEmail && !hasMobile) {
      skipped.push({ rowIndex: idx, reason: 'no email or mobile' });
      continue;
    }
    extracted.push({ _rowIndex: idx, ...record });
  }

  return { extracted, skipped };
}

function mapRow(row) {
  const lower = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === '_rowIndex') continue;
    lower[k.toLowerCase()] = v ?? null;
  }

  const pick = (aliases) => {
    for (const a of aliases) {
      for (const k of Object.keys(lower)) {
        if (k === a || k.includes(a)) return lower[k];
      }
    }
    return null;
  };

  const rawPhone = pick(['mobile', 'phone', 'contact', 'number', 'whatsapp']);
  const { countryCode, mobile } = splitPhone(rawPhone);

  const status = mapStatus(pick(['status', 'stage', 'disposition']));
  const source = mapSource(pick(['source', 'campaign', 'project']));

  return {
    created_at: normalizeDate(pick(['created', 'date', 'timestamp'])),
    name: pick(['name', 'full name', 'lead name']) ?? combineName(lower),
    email: firstEmail(pick(['email', 'e-mail', 'mail'])),
    country_code: countryCode,
    mobile_without_country_code: mobile,
    company: pick(['company', 'organization', 'org', 'business']),
    city: pick(['city', 'town']),
    state: pick(['state', 'province', 'region']),
    country: pick(['country']),
    lead_owner: pick(['owner', 'assigned', 'agent', 'rep']),
    crm_status: status,
    crm_note: pick(['note', 'remark', 'comment', 'notes']),
    data_source: source,
    possession_time: pick(['possession']),
    description: pick(['description', 'desc', 'details']),
  };
}

function combineName(lower) {
  const first = lower['first name'] ?? lower['firstname'] ?? lower['fname'];
  const last = lower['last name'] ?? lower['lastname'] ?? lower['lname'];
  if (!first && !last) return null;
  return [first, last].filter(Boolean).join(' ');
}

function firstEmail(v) {
  if (!v) return null;
  const m = String(v).match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return m?.[0] ?? null;
}

function splitPhone(v) {
  if (!v) return { countryCode: null, mobile: null };
  const s = String(v).trim();
  const cc = s.match(/^\+?(\d{1,3})[ -]?(\d{6,})$/);
  if (cc) {
    return { countryCode: `+${cc[1]}`, mobile: cc[2].replace(/\D/g, '') };
  }
  const digits = s.replace(/\D/g, '');
  if (!digits) return { countryCode: null, mobile: null };
  return { countryCode: null, mobile: digits };
}

function mapStatus(v) {
  if (!v) return null;
  const s = String(v).toLowerCase();
  if (CRM_STATUS_VALUES.includes(String(v))) return String(v);
  if (/(closed|won|sold|sale)/.test(s)) return 'SALE_DONE';
  if (/(not interested|junk|spam|bad|dead)/.test(s)) return 'BAD_LEAD';
  if (/(busy|no answer|unreach|call back|did not)/.test(s)) return 'DID_NOT_CONNECT';
  if (/(follow|hot|warm|interested|good)/.test(s)) return 'GOOD_LEAD_FOLLOW_UP';
  return null;
}

function mapSource(v) {
  if (!v) return '';
  const s = String(v).toLowerCase().replace(/[\s-]+/g, '_');
  const hit = DATA_SOURCE_VALUES.find((x) => s.includes(x));
  return hit ?? '';
}

function normalizeDate(v) {
  if (!v) return null;
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
