import Papa from 'papaparse';
import { CRM_FIELDS } from '../constants/crm.js';

/**
 * Serialize an array of canonical CRM records to a CSV string.
 * @param {Array<Record<string, any>>} records
 * @returns {string}
 */
export function recordsToCsv(records) {
  const rows = records.map((r) => {
    const out = {};
    for (const f of CRM_FIELDS) out[f] = r[f] ?? '';
    return out;
  });
  return Papa.unparse({ fields: CRM_FIELDS, data: rows });
}

/**
 * Trigger a file download in the browser.
 * @param {string} filename
 * @param {string} content
 * @param {string} [mime]
 */
export function downloadFile(filename, content, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function humanBytes(bytes) {
  if (bytes == null) return '';
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}
