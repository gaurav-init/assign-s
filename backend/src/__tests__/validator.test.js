import { describe, it, expect } from 'vitest';
import { validateRecord } from '../services/validator.service.js';

const baseRecord = {
  created_at: '2026-05-13T14:20:48Z',
  name: 'John Doe',
  email: 'john@example.com',
  country_code: '+91',
  mobile_without_country_code: '9876543210',
  company: null,
  city: null,
  state: null,
  country: null,
  lead_owner: null,
  crm_status: 'GOOD_LEAD_FOLLOW_UP',
  crm_note: null,
  data_source: '',
  possession_time: null,
  description: null,
};

describe('validator', () => {
  it('accepts a well-formed record', () => {
    const r = validateRecord(baseRecord);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.record.email).toBe('john@example.com');
  });

  it('skips when both email and mobile are missing', () => {
    const r = validateRecord({ ...baseRecord, email: null, mobile_without_country_code: null });
    expect(r.ok).toBe(false);
  });

  it('accepts email-only records', () => {
    const r = validateRecord({ ...baseRecord, mobile_without_country_code: null });
    expect(r.ok).toBe(true);
  });

  it('accepts mobile-only records', () => {
    const r = validateRecord({ ...baseRecord, email: null });
    expect(r.ok).toBe(true);
  });

  it('coerces an unknown crm_status to null', () => {
    const r = validateRecord({ ...baseRecord, crm_status: 'HOT_LEAD' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.record.crm_status).toBeNull();
  });

  it('normalizes country_code with leading "+"', () => {
    const r = validateRecord({ ...baseRecord, country_code: '91' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.record.country_code).toBe('+91');
  });

  it('strips non-digits from mobile', () => {
    const r = validateRecord({ ...baseRecord, mobile_without_country_code: '(987) 654-3210' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.record.mobile_without_country_code).toBe('9876543210');
  });

  it('resets invalid data_source to empty', () => {
    const r = validateRecord({ ...baseRecord, data_source: 'random_thing' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.record.data_source).toBe('');
  });

  it('escapes embedded newlines in text fields', () => {
    const r = validateRecord({ ...baseRecord, crm_note: 'line1\nline2' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.record.crm_note).toBe('line1\\nline2');
  });

  it('nulls out a non-parseable created_at', () => {
    const r = validateRecord({ ...baseRecord, created_at: 'not a date' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.record.created_at).toBeNull();
  });
});
