import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  X,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Loader2,
  Database,
  ArrowRight,
} from 'lucide-react';
import { getImport, listImports } from '../../lib/api.js';
import { cn } from '../../lib/cn.js';
import { humanBytes } from '../../lib/csv.js';

export function HistoryDrawer({ open, onClose, onOpenResult }) {
  const [state, setState] = useState({ status: 'idle', items: [], enabled: true, total: 0 });
  const [loadingId, setLoadingId] = useState(null);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      const data = await listImports({ limit: 50 });
      setState({
        status: 'ok',
        items: data.items ?? [],
        enabled: data.enabled ?? false,
        total: data.total ?? 0,
      });
    } catch (err) {
      setState({ status: 'error', items: [], enabled: false, total: 0, error: err.message });
    }
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const handleOpen = useCallback(
    async (importId) => {
      setLoadingId(importId);
      try {
        const entry = await getImport(importId);
        if (entry?.status === 'done') {
          onOpenResult?.({
            importId,
            totalRows: entry.rowCount,
            imported: entry.imported ?? [],
            skipped: entry.skipped ?? [],
            counts: entry.counts ?? { imported: 0, skipped: 0, total: entry.rowCount ?? 0 },
            batches: entry.batches ?? { total: 0, succeeded: 0, failed: 0, retries: 0 },
          });
          onClose();
        }
      } finally {
        setLoadingId(null);
      }
    },
    [onClose, onOpenResult]
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink-950/30 backdrop-blur-sm dark:bg-black/60"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            role="dialog"
            aria-label="Import history"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-ink-200/80 bg-white/95 backdrop-blur-xl dark:border-ink-700/60 dark:bg-ink-950/95"
          >
            <header className="flex items-center justify-between border-b border-ink-200/80 px-4 py-3 dark:border-ink-700/60">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-control text-ink-950"
                  style={{
                    background: 'linear-gradient(180deg, #ffd04a 0%, #ffb900 60%, #d99a00 100%)',
                    boxShadow:
                      'inset 0 1px 0 0 rgba(255,255,255,0.4), inset 0 -1px 0 0 rgba(0,0,0,0.25)',
                  }}
                >
                  <Clock className="h-4 w-4" strokeWidth={2.25} />
                </div>
                <div>
                  <div className="label-strong">Module_H1 · History</div>
                  <div className="label mt-0.5">
                    {state.enabled
                      ? `${state.total.toLocaleString()} past imports`
                      : 'Persistence disabled'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={refresh}
                  className="btn-ghost h-8 w-8 !p-0"
                  aria-label="Refresh"
                  type="button"
                >
                  <RefreshCw
                    className={cn('h-3.5 w-3.5', state.status === 'loading' && 'animate-spin')}
                  />
                </button>
                <button
                  onClick={onClose}
                  className="btn-ghost h-8 w-8 !p-0"
                  aria-label="Close"
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-3">
              {state.status === 'loading' && state.items.length === 0 ? (
                <SkeletonList />
              ) : !state.enabled ? (
                <EmptyPanel
                  icon={Database}
                  title="Mongo not connected"
                  body={
                    <>
                      Set{' '}
                      <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[11px] dark:bg-ink-800/70">
                        MONGODB_URI
                      </code>{' '}
                      in{' '}
                      <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[11px] dark:bg-ink-800/70">
                        backend/.env
                      </code>{' '}
                      to persist imports.
                    </>
                  }
                />
              ) : state.items.length === 0 ? (
                <EmptyPanel
                  icon={Clock}
                  title="No imports yet"
                  body="Your uploads will appear here once you run one."
                />
              ) : (
                <ul className="space-y-2">
                  {state.items.map((it) => (
                    <li key={it.importId}>
                      <HistoryRow
                        entry={it}
                        loading={loadingId === it.importId}
                        onOpen={() => handleOpen(it.importId)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function HistoryRow({ entry, loading, onOpen }) {
  const done = entry.status === 'done';
  const failed = entry.status === 'failed';
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!done || loading}
      className={cn(
        'group w-full rounded-card border p-3 text-left transition-all',
        'border-ink-200/80 bg-white/70 dark:border-ink-700/60 dark:bg-ink-900/60',
        done &&
          'hover:border-amber-500/60 hover:bg-white dark:hover:border-amber-500/50 dark:hover:bg-ink-800/70',
        !done && 'opacity-70'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-[3px] border border-ink-200/80 bg-ink-100 p-1.5 text-ink-500 dark:border-ink-700/60 dark:bg-ink-800/70 dark:text-ink-300">
          <FileSpreadsheet className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate font-mono text-[12.5px] text-ink-900 dark:text-white">
              {entry.fileName ?? 'unknown.csv'}
            </div>
            <StatusPill status={entry.status} />
          </div>
          <div className="label mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span>{formatDate(entry.createdAt)}</span>
            <span>·</span>
            <span>{(entry.rowCount ?? 0).toLocaleString()} rows</span>
            {entry.fileSize != null && (
              <>
                <span>·</span>
                <span>{humanBytes(entry.fileSize)}</span>
              </>
            )}
          </div>
          {done && entry.counts && (
            <div className="mt-2 flex items-center gap-3 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1 text-signal-ok">
                <CheckCircle2 className="h-3 w-3" />
                {entry.counts.imported.toLocaleString()} imported
              </span>
              <span className="inline-flex items-center gap-1 text-signal-bad">
                <XCircle className="h-3 w-3" />
                {entry.counts.skipped.toLocaleString()} skipped
              </span>
            </div>
          )}
          {failed && entry.error && (
            <div className="mt-2 truncate font-mono text-[11px] text-signal-bad">
              {entry.error}
            </div>
          )}
        </div>
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          ) : done ? (
            <ArrowRight className="h-4 w-4 text-amber-500" />
          ) : null}
        </div>
      </div>
    </button>
  );
}

function StatusPill({ status }) {
  const cfg =
    status === 'done'
      ? { cls: 'border-signal-ok/50 bg-signal-ok/15 text-signal-ok', Icon: CheckCircle2, label: 'Done' }
      : status === 'failed'
        ? { cls: 'border-signal-bad/50 bg-signal-bad/15 text-signal-bad', Icon: AlertOctagon, label: 'Failed' }
        : status === 'parsed'
          ? { cls: 'border-signal-warn/50 bg-signal-warn/15 text-signal-warn', Icon: Loader2, label: 'Parsed' }
          : {
              cls: 'border-ink-200/80 bg-ink-100 text-ink-500 dark:border-ink-700/60 dark:bg-ink-800/70 dark:text-ink-300',
              Icon: Clock,
              label: status ?? 'unknown',
            };
  const { cls, Icon, label } = cfg;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]',
        cls
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function EmptyPanel({ icon: Icon, title, body }) {
  return (
    <div className="mx-auto flex max-w-xs flex-col items-center gap-2 py-16 text-center">
      <div className="rounded-control border border-ink-200/80 bg-white/70 p-3 text-ink-500 dark:border-ink-700/60 dark:bg-ink-800/60 dark:text-ink-300">
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-serif text-lg text-ink-900 dark:text-white">{title}</div>
      <div className="mono">{body}</div>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className="rounded-card border border-ink-200/80 p-3 dark:border-ink-700/60"
        >
          <div className="skeleton mb-2 h-4 w-2/3 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </li>
      ))}
    </ul>
  );
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  const now = Date.now();
  const diff = now - date.getTime();
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < min) return 'just now';
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
