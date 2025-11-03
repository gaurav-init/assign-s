import { useCallback, useReducer, useRef } from 'react';
import { extractImportStream, parseCsv } from '../lib/api.js';

/**
 * @typedef {'idle'|'parsing'|'preview'|'extracting'|'done'|'error'} Step
 */

const initial = {
  step: 'idle',
  file: null,
  parse: null,
  progress: {
    totalBatches: 0,
    batches: [],
    imported: 0,
    skipped: 0,
    retries: 0,
  },
  result: null,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'PARSE_START':
      return { ...initial, step: 'parsing', file: action.file };
    case 'PARSE_OK':
      return { ...state, step: 'preview', parse: action.parse };
    case 'RESET':
      return initial;
    case 'ERROR':
      return { ...state, step: 'error', error: action.error };
    case 'EXTRACT_START':
      return {
        ...state,
        step: 'extracting',
        result: null,
        error: null,
        progress: { ...initial.progress },
      };
    case 'EXTRACT_EVENT':
      return { ...state, progress: reduceProgress(state.progress, action.event) };
    case 'EXTRACT_DONE':
      return { ...state, step: 'done', result: action.result };
    default:
      return state;
  }
}

function reduceProgress(prog, event) {
  const next = { ...prog, batches: [...prog.batches] };
  switch (event.type) {
    case 'start': {
      next.totalBatches = event.data.totalBatches;
      next.batches = Array.from({ length: event.data.totalBatches }, (_, i) => ({
        index: i,
        status: 'pending',
      }));
      return next;
    }
    case 'batch_start': {
      next.batches[event.data.batchIndex] = { index: event.data.batchIndex, status: 'processing' };
      return next;
    }
    case 'batch_retry': {
      next.retries = (next.retries ?? 0) + 1;
      const b = next.batches[event.data.batchIndex] ?? { index: event.data.batchIndex };
      next.batches[event.data.batchIndex] = { ...b, status: 'retry', attempt: event.data.attempt };
      return next;
    }
    case 'batch_done': {
      next.imported += event.data.imported;
      next.skipped += event.data.skipped;
      next.batches[event.data.batchIndex] = {
        index: event.data.batchIndex,
        status: 'done',
        imported: event.data.imported,
        skipped: event.data.skipped,
      };
      return next;
    }
    case 'batch_failed': {
      next.batches[event.data.batchIndex] = {
        index: event.data.batchIndex,
        status: 'failed',
        message: event.data.message,
      };
      return next;
    }
    default:
      return next;
  }
}

export function useImportFlow() {
  const [state, dispatch] = useReducer(reducer, initial);
  const abortRef = useRef(null);

  const upload = useCallback(async (file) => {
    dispatch({ type: 'PARSE_START', file });
    try {
      const parse = await parseCsv(file);
      dispatch({ type: 'PARSE_OK', parse });
    } catch (error) {
      dispatch({ type: 'ERROR', error });
    }
  }, []);

  const confirm = useCallback(async () => {
    if (!state.parse) return;
    dispatch({ type: 'EXTRACT_START' });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      let finalResult = null;
      for await (const event of extractImportStream(state.parse.importId, {
        signal: controller.signal,
      })) {
        if (event.type === 'result') finalResult = event.data;
        else if (event.type === 'error') throw Object.assign(new Error(event.data.message), { code: event.data.code });
        else dispatch({ type: 'EXTRACT_EVENT', event });
      }
      if (finalResult) dispatch({ type: 'EXTRACT_DONE', result: finalResult });
      else dispatch({ type: 'ERROR', error: new Error('Extraction ended without a result') });
    } catch (error) {
      if (error.name === 'AbortError') {
        dispatch({ type: 'RESET' });
        return;
      }
      dispatch({ type: 'ERROR', error });
    } finally {
      abortRef.current = null;
    }
  }, [state.parse]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ type: 'RESET' });
  }, []);

  const openHistoricalResult = useCallback((result) => {
    dispatch({ type: 'EXTRACT_DONE', result });
  }, []);

  return { state, upload, confirm, cancel, reset, openHistoricalResult };
}
