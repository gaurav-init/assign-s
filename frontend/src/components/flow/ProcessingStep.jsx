import { motion } from 'framer-motion';
import {
  Loader2,
  X,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Timer,
  Sparkles,
} from 'lucide-react';
import { Module } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { ProgressBar } from '../ui/ProgressBar.jsx';
import { cn } from '../../lib/cn.js';

const CHIP_STYLE = {
  pending: 'border-ink-700/60 bg-ink-800/70 text-ink-400',
  processing: 'border-amber-500/70 bg-amber-500/25 text-amber-500 animate-pulseRing',
  retry: 'border-signal-warn/70 bg-signal-warn/20 text-signal-warn',
  done: 'border-signal-ok/70 bg-signal-ok/20 text-signal-ok',
  failed: 'border-signal-bad/70 bg-signal-bad/25 text-signal-bad',
};

const CHIP_ICON = {
  processing: Loader2,
  retry: RotateCw,
  done: CheckCircle2,
  failed: AlertCircle,
};

export function ProcessingStep({ progress, onCancel }) {
  const total = progress.totalBatches || 0;
  const completed = progress.batches.filter(
    (b) => b.status === 'done' || b.status === 'failed'
  ).length;
  const pct = total ? (completed / total) * 100 : 5;
  const active = progress.batches.filter((b) => b.status === 'processing').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-3xl"
    >
      <Module
        id="MODULE_A3 · EXTRACT"
        badge="Running"
        tone="blood"
        right={
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" /> Cancel
          </Button>
        }
      >
        <div className="mb-5">
          <div className="label-strong text-white/85 mb-2 inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-blip rounded-full bg-amber-500" />
            AI extraction in progress
          </div>
          <h2 className="font-serif text-3xl leading-tight text-white">
            Reading your leads with AI…
          </h2>
          <p className="font-serif text-base leading-relaxed text-white/80 mt-1">
            Rows are batched, retried on transient failures, and validated as they arrive.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="label text-white/85">
              <span className="text-white">{completed}</span> / <span>{total || '?'}</span>{' '}
              batches complete
              {active > 0 && <span className="ml-2 text-amber-500">· {active} in flight</span>}
            </div>
            <div className="font-mono text-[11px] text-white">{Math.round(pct)}%</div>
          </div>
          <ProgressBar value={pct} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStat icon={CheckCircle2} label="Imported" value={progress.imported} tone="ok" />
          <MiniStat icon={AlertCircle} label="Skipped" value={progress.skipped} tone="bad" />
          <MiniStat icon={RotateCw} label="Retries" value={progress.retries} tone="warn" />
          <MiniStat icon={Cpu} label="In flight" value={active} tone="brand" />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="label text-white/80">Batches</div>
            <div className="label inline-flex items-center gap-1 text-white/60">
              <Timer className="h-3 w-3" /> Live
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {progress.batches.length === 0
              ? Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className="skeleton h-6 w-8 rounded-[3px]" />
                ))
              : progress.batches.map((b) => {
                  const Icon = CHIP_ICON[b.status];
                  return (
                    <div
                      key={b.index}
                      title={`Batch #${b.index + 1} · ${b.status}${b.imported != null ? ` · +${b.imported}` : ''}${b.message ? ` · ${b.message}` : ''}`}
                      className={cn(
                        'flex h-6 min-w-8 items-center justify-center gap-1 rounded-[3px] border px-1.5 font-mono text-[10px] uppercase tracking-[0.06em]',
                        CHIP_STYLE[b.status] ?? CHIP_STYLE.pending
                      )}
                    >
                      {Icon ? (
                        <Icon
                          className={cn(
                            'h-3 w-3',
                            b.status === 'processing' && 'animate-spin'
                          )}
                        />
                      ) : null}
                      {String(b.index + 1).padStart(2, '0')}
                    </div>
                  );
                })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3">
          <div className="label text-white/80 inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Gemini 3.1 Flash-Lite · Streaming via SSE
          </div>
          <div className="label text-white/60">
            Safe to close · run continues server-side
          </div>
        </div>
      </Module>
    </motion.div>
  );
}

function MiniStat({ icon: Icon, label, value, tone }) {
  const tones = {
    ok: 'text-signal-ok',
    bad: 'text-signal-bad',
    warn: 'text-signal-warn',
    brand: 'text-amber-500',
  };
  return (
    <div className="flex items-center gap-2 rounded-card border border-white/10 bg-black/25 p-3">
      <div className={cn('rounded-[3px] border border-white/10 bg-white/5 p-1.5', tones[tone])}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <div className="label text-white/70">{label}</div>
        <div className="font-mono text-lg font-medium text-white">
          {Number(value ?? 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
