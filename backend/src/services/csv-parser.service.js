import { parse } from 'csv-parse/sync';
import { Errors } from '../utils/errors.js';

/**
 * Parse a raw CSV buffer into an array of objects keyed by header name.
 * Handles: BOM, quoted fields, embedded newlines, semicolon/tab delimiters.
 *
 * @param {Buffer|string} input
 * @returns {{ columns: string[], rows: Record<string, string>[] }}
 */
export function parseCsv(input) {
  const text = Buffer.isBuffer(input) ? input.toString('utf8') : String(input);
  if (!text.trim()) {
    throw Errors.invalidCsv('CSV file is empty');
  }

  const delimiter = detectDelimiter(text);

  let records;
  try {
    records = parse(text, {
      columns: (header) => header.map((h) => (h ?? '').toString().trim()),
      delimiter,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      trim: true,
      bom: true,
    });
  } catch (err) {
    throw Errors.invalidCsv(err.message);
  }

  if (!Array.isArray(records) || records.length === 0) {
    throw Errors.invalidCsv('CSV has no data rows');
  }

  const columns = Object.keys(records[0] || {});

  if (columns.length === 0) {
    throw Errors.invalidCsv('Could not detect columns in CSV');
  }

  return { columns, rows: records };
}

/**
 * Heuristic delimiter detection from the first non-empty line.
 * @param {string} text
 * @returns {string}
 */
function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? '';
  const candidates = [',', ';', '\t', '|'];
  let best = ',';
  let bestCount = -1;
  for (const c of candidates) {
    const count = firstLine.split(c).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = c;
    }
  }
  return best;
}
