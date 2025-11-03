import { describe, it, expect } from 'vitest';
import { SYSTEM_PROMPT, buildUserPrompt } from '../services/ai/prompt.js';
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from '../schemas/crm.schema.js';

describe('prompt', () => {
  it('lists all allowed statuses', () => {
    for (const s of CRM_STATUS_VALUES) expect(SYSTEM_PROMPT).toContain(s);
  });

  it('lists all allowed data sources', () => {
    for (const s of DATA_SOURCE_VALUES) expect(SYSTEM_PROMPT).toContain(s);
  });

  it('user prompt embeds every row as JSON', () => {
    const rows = [
      { _rowIndex: 0, name: 'A' },
      { _rowIndex: 1, name: 'B' },
    ];
    const p = buildUserPrompt(rows);
    expect(p).toContain('_rowIndex');
    expect(p).toContain('"name": "A"');
    expect(p).toContain('"name": "B"');
  });
});
