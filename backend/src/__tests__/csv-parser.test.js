import { describe, it, expect } from 'vitest';
import { parseCsv } from '../services/csv-parser.service.js';

describe('csv-parser', () => {
  it('parses a simple comma CSV', () => {
    const csv = 'name,email\nJohn,j@x.com\nJane,jane@x.com\n';
    const { columns, rows } = parseCsv(csv);
    expect(columns).toEqual(['name', 'email']);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: 'John', email: 'j@x.com' });
  });

  it('detects semicolon delimiter', () => {
    const csv = 'name;email\nJohn;j@x.com';
    const { columns } = parseCsv(csv);
    expect(columns).toEqual(['name', 'email']);
  });

  it('handles quoted fields with commas', () => {
    const csv = 'name,note\nJohn,"Hello, world"';
    const { rows } = parseCsv(csv);
    expect(rows[0].note).toBe('Hello, world');
  });

  it('strips BOM', () => {
    const csv = '﻿name,email\nJohn,j@x.com';
    const { columns } = parseCsv(csv);
    expect(columns[0]).toBe('name');
  });

  it('throws on empty CSV', () => {
    expect(() => parseCsv('')).toThrow();
  });

  it('tolerates ragged rows', () => {
    const csv = 'a,b,c\n1,2\n1,2,3,4';
    const { rows } = parseCsv(csv);
    expect(rows).toHaveLength(2);
  });
});
