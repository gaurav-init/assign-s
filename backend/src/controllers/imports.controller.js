import { parseCsv } from '../services/csv-parser.service.js';
import { importStore } from '../services/import-store.service.js';
import { processRows } from '../services/batch-processor.service.js';
import {
  recordParse,
  recordExtract,
  recordFailure,
  listHistory,
  getHistoryEntry,
} from '../services/history.service.js';
import { openSseStream } from '../utils/sse.js';
import { Errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * POST /api/v1/imports/parse
 * multipart: file=<csv>
 */
export async function parseUpload(req, res, next) {
  try {
    if (!req.file) throw Errors.invalidFile('No file uploaded');
    const { columns, rows } = parseCsv(req.file.buffer);

    const withIdx = rows.map((r, i) => ({ _rowIndex: i, ...r }));
    const importId = importStore.create({
      columns,
      rows: withIdx,
      fileName: req.file.originalname,
    });

    // fire-and-forget persistence
    recordParse({
      importId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      columns,
      rowCount: rows.length,
    });

    const PREVIEW = 100;
    res.json({
      importId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      columns,
      rowCount: rows.length,
      previewRows: rows.slice(0, PREVIEW),
      previewTruncated: rows.length > PREVIEW,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/imports/:importId/extract
 * Query: ?stream=true → SSE
 */
export async function extractImport(req, res, next) {
  const { importId } = req.params;
  const stream = req.query.stream === 'true';
  const entry = importStore.get(importId);
  if (!entry) return next(Errors.importNotFound(importId));

  const controller = new AbortController();
  req.on('close', () => controller.abort());

  logger.info('extract:start', { importId, rows: entry.rows.length, stream, reqId: req.id });

  if (stream) {
    const { send, close } = openSseStream(res);
    try {
      const result = await processRows(entry.rows, {
        signal: controller.signal,
        onEvent: (event, payload) => send(event, payload),
      });
      const formatted = formatResult(entry.rows.length, result);
      await recordExtract(importId, formatted);
      send('result', { importId, ...formatted });
      close();
    } catch (err) {
      logger.error('extract:stream failed', { message: err.message, importId });
      await recordFailure(importId, err.message);
      send('error', { code: err.code ?? 'INTERNAL', message: err.message });
      close();
    }
    return;
  }

  try {
    const result = await processRows(entry.rows, { signal: controller.signal });
    const formatted = formatResult(entry.rows.length, result);
    await recordExtract(importId, formatted);
    res.json({ importId, ...formatted });
  } catch (err) {
    await recordFailure(importId, err.message);
    next(err);
  }
}

/**
 * GET /api/v1/imports/history?limit=&skip=
 */
export async function history(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);
    const result = await listHistory({ limit, skip });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/imports/history/:importId
 */
export async function historyDetail(req, res, next) {
  try {
    const entry = await getHistoryEntry(req.params.importId);
    if (!entry) return next(Errors.importNotFound(req.params.importId));
    res.json(entry);
  } catch (err) {
    next(err);
  }
}

function formatResult(totalRows, result) {
  return {
    totalRows,
    imported: result.imported,
    skipped: result.skipped,
    counts: {
      imported: result.imported.length,
      skipped: result.skipped.length,
      total: totalRows,
    },
    batches: result.batches,
  };
}
