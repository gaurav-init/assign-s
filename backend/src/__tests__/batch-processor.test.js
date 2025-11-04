import { describe, it, expect } from 'vitest';
import { processRows } from '../services/batch-processor.service.js';

describe('batch-processor (mock provider)', () => {
  it('imports rows with contact info', async () => {
    const rows = [
      {
        _rowIndex: 0,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 9876543210',
        status: 'follow up',
      },
      {
        _rowIndex: 1,
        name: 'Sarah',
        email: 'sarah@example.com',
        phone: '9876543211',
        status: 'won',
      },
    ];
    const result = await processRows(rows, { batchSize: 10, concurrency: 1 });
    expect(result.imported).toHaveLength(2);
    expect(result.imported[0].email).toBe('john@example.com');
    expect(result.imported[1].crm_status).toBe('SALE_DONE');
  });

  it('skips rows missing both email and mobile', async () => {
    const rows = [
      { _rowIndex: 0, name: 'Nobody' },
      { _rowIndex: 1, name: 'Somebody', email: 'x@y.com' },
    ];
    const result = await processRows(rows, { batchSize: 10, concurrency: 1 });
    expect(result.imported).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].rowIndex).toBe(0);
  });

  it('handles multiple batches concurrently', async () => {
    const rows = Array.from({ length: 25 }, (_, i) => ({
      _rowIndex: i,
      name: `Lead ${i}`,
      email: `lead${i}@example.com`,
      phone: `+91 987654321${i % 10}`,
    }));
    const result = await processRows(rows, { batchSize: 10, concurrency: 3 });
    expect(result.imported).toHaveLength(25);
    expect(result.batches.total).toBe(3);
    expect(result.batches.succeeded).toBe(3);
  });
});
