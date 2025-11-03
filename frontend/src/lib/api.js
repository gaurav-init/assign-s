const BACKEND = import.meta.env.VITE_BACKEND_URL || '';
const BASE = BACKEND ? `${BACKEND.replace(/\/$/, '')}/api/v1` : '/api/v1';

async function handle(res) {
  if (res.ok) return res.json();
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* noop */
  }
  const message =
    payload?.error?.message ?? `Request failed with ${res.status} ${res.statusText}`;
  const err = new Error(message);
  err.code = payload?.error?.code ?? 'REQUEST_FAILED';
  err.status = res.status;
  throw err;
}

export async function parseCsv(file, { signal } = {}) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/imports/parse`, {
    method: 'POST',
    body: form,
    signal,
  });
  return handle(res);
}

export async function extractImport(importId, { signal } = {}) {
  const res = await fetch(`${BASE}/imports/${importId}/extract`, {
    method: 'POST',
    signal,
  });
  return handle(res);
}

/**
 * Stream extraction progress via SSE. Yields events with { type, data }.
 * Uses fetch + a manual SSE parser so we can POST and pass an AbortSignal
 * (native EventSource is GET-only).
 */
export async function* extractImportStream(importId, { signal } = {}) {
  const res = await fetch(`${BASE}/imports/${importId}/extract?stream=true`, {
    method: 'POST',
    headers: { Accept: 'text/event-stream' },
    signal,
  });
  if (!res.ok || !res.body) {
    await handle(res);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const evt = parseSseFrame(raw);
      if (evt) yield evt;
    }
  }
}

function parseSseFrame(frame) {
  const lines = frame.split('\n');
  let event = 'message';
  const dataLines = [];
  for (const line of lines) {
    if (line.startsWith(':')) continue;
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
  }
  if (!dataLines.length) return null;
  try {
    return { type: event, data: JSON.parse(dataLines.join('\n')) };
  } catch {
    return { type: event, data: dataLines.join('\n') };
  }
}

export async function checkHealth() {
  const res = await fetch(`${BASE}/health`);
  return handle(res);
}

export async function listImports({ limit = 20, skip = 0 } = {}) {
  const res = await fetch(`${BASE}/imports/history?limit=${limit}&skip=${skip}`);
  return handle(res);
}

export async function getImport(importId) {
  const res = await fetch(`${BASE}/imports/history/${importId}`);
  return handle(res);
}
