import pLimit from 'p-limit';
import { env } from '../config/env.js';
import { extractBatch } from './ai/ai-client.js';
import { validateRecord } from './validator.service.js';
import { retry } from '../utils/retry.js';
import { logger } from '../utils/logger.js';

/**
 * Turn raw CSV rows into (imported, skipped) via batched, retried AI extraction.
 *
 * @param {Array<Record<string, any>>} rows
 * @param {{
 *   batchSize?: number,
 *   concurrency?: number,
 *   maxRetries?: number,
 *   signal?: AbortSignal,
 *   onEvent?: (event: string, payload: any) => void,
 * }} [opts]
 * @returns {Promise<{
 *   imported: any[],
 *   skipped: { rowIndex: number, reason: string, raw?: any }[],
 *   batches: { total: number, succeeded: number, failed: number, retries: number },
 * }>}
 */
export async function processRows(rows, opts = {}) {
  const batchSize = opts.batchSize ?? env.BATCH_SIZE;
  const concurrency = opts.concurrency ?? env.AI_CONCURRENCY;
  const maxRetries = opts.maxRetries ?? env.AI_MAX_RETRIES;
  const emit = opts.onEvent ?? (() => {});

  const batches = chunk(rows, batchSize);
  const total = batches.length;

  emit('start', { totalRows: rows.length, totalBatches: total, batchSize });

  const limit = pLimit(concurrency);
  const imported = [];
  const skipped = [];
  let succeeded = 0;
  let failed = 0;
  let retryCount = 0;

  const results = await Promise.all(
    batches.map((batchRows, batchIndex) =>
      limit(async () => {
        if (opts.signal?.aborted) return { batchIndex, aborted: true };

        emit('batch_start', { batchIndex, size: batchRows.length });

        const inputRows = batchRows.map((r, i) => ({
          _rowIndex: r._rowIndex ?? batchIndex * batchSize + i,
          ...stripInternal(r),
        }));

        try {
          const resp = await retry(() => extractBatch(inputRows), {
            retries: maxRetries,
            baseMs: 500,
            factor: 3,
            onRetry: (err, attempt) => {
              retryCount += 1;
              logger.warn(`batch ${batchIndex} retry ${attempt}`, { message: err.message });
              emit('batch_retry', { batchIndex, attempt, message: err.message });
            },
          });

          const localImported = [];
          const localSkipped = [];

          const rawByIdx = new Map(inputRows.map((r) => [r._rowIndex, r]));
          const seenIdx = new Set();

          for (const rec of resp.extracted ?? []) {
            const idx = rec._rowIndex ?? -1;
            seenIdx.add(idx);
            const raw = rawByIdx.get(idx);
            const { _rowIndex, ...body } = rec;
            const v = validateRecord(body, raw);
            if (v.ok) {
              localImported.push({ _rowIndex: idx, ...v.record });
            } else {
              localSkipped.push({ rowIndex: idx, reason: v.reason, raw });
            }
          }

          for (const s of resp.skipped ?? []) {
            if (!seenIdx.has(s.rowIndex)) {
              localSkipped.push({
                rowIndex: s.rowIndex,
                reason: s.reason,
                raw: rawByIdx.get(s.rowIndex),
              });
              seenIdx.add(s.rowIndex);
            }
          }

          for (const r of inputRows) {
            if (!seenIdx.has(r._rowIndex)) {
              localSkipped.push({
                rowIndex: r._rowIndex,
                reason: 'ai_missing_row',
                raw: r,
              });
            }
          }

          succeeded += 1;
          emit('batch_done', {
            batchIndex,
            imported: localImported.length,
            skipped: localSkipped.length,
          });

          return { batchIndex, imported: localImported, skipped: localSkipped };
        } catch (err) {
          failed += 1;
          logger.error(`batch ${batchIndex} failed permanently`, { message: err.message });
          emit('batch_failed', { batchIndex, message: err.message });
          const localSkipped = inputRows.map((r) => ({
            rowIndex: r._rowIndex,
            reason: `ai_batch_failed: ${err.message}`,
            raw: r,
          }));
          return { batchIndex, imported: [], skipped: localSkipped };
        }
      })
    )
  );

  for (const r of results) {
    if (r?.aborted) continue;
    imported.push(...(r?.imported ?? []));
    skipped.push(...(r?.skipped ?? []));
  }

  // Preserve input order.
  imported.sort((a, b) => a._rowIndex - b._rowIndex);
  skipped.sort((a, b) => a.rowIndex - b.rowIndex);
  imported.forEach((r) => delete r._rowIndex);

  emit('done', {
    imported: imported.length,
    skipped: skipped.length,
    total: rows.length,
    batches: { total, succeeded, failed, retries: retryCount },
  });

  return {
    imported,
    skipped,
    batches: { total, succeeded, failed, retries: retryCount },
  };
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function stripInternal(row) {
  const { _rowIndex, ...rest } = row;
  return rest;
}
