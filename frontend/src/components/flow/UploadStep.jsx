import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Bot,
  Layers,
  ShieldCheck,
  Wand2,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Module } from '../ui/Card.jsx';
import { Dropzone } from '../shared/Dropzone.jsx';
import { cn } from '../../lib/cn.js';
import { SAMPLES, sampleToFile } from '../../constants/samples.js';

const MODULES = [
  {
    id: 'MOD_M1 · MAPPING',
    icon: Bot,
    title: 'AI reads column meaning',
    body: 'Not header-matching. A column called "notes" that actually holds a phone number lands in mobile_without_country_code.',
  },
  {
    id: 'MOD_M2 · STREAM',
    icon: Layers,
    title: 'Batched + streamed',
    body: 'Rows split into 20-row batches, parallelized with a concurrency cap, retried on transient failures. Live SSE events.',
  },
  {
    id: 'MOD_M3 · GUARD',
    icon: ShieldCheck,
    title: 'Schema-safe output',
    body: 'Every value re-validated server-side: enum whitelists, phone digits, date round-trip, escaped newlines.',
  },
];

const SUPPORTED = [
  'Facebook Lead Export',
  'Google Ads',
  'Excel',
  'Real-estate CRM',
  'Marketing agency',
  'Hand-rolled',
];

export function UploadStep({ onFile, parsing }) {
  const loadSample = useCallback(
    (sample) => {
      if (parsing) return;
      onFile(sampleToFile(sample));
    },
    [onFile, parsing]
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* -------- HERO (2-column) -------- */}
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-5"
        >
          <div className="label-strong inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-blip rounded-full bg-amber-500" />
            GrowEasy · Module_A1 · Ingest
          </div>

          <h1 className="font-serif text-5xl leading-[1.05] tracking-[-0.02em] text-ink-900 sm:text-6xl lg:text-[64px] dark:text-white">
            Turn any messy CSV
            <br />
            into <em className="text-amber-600 dark:text-amber-500">clean CRM leads</em>.
          </h1>

          <p className="max-w-xl font-serif text-lg leading-relaxed text-ink-700 dark:text-ink-200">
            Drop any lead export — Facebook, Google Ads, Excel, real-estate dumps. The AI
            extracts, cleans, and normalizes every row into GrowEasy's canonical schema. Zero
            manual mapping.
          </p>

          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex"
        >
          <TransformDemo />
        </motion.div>
      </div>

      {/* -------- DROPZONE (full width) -------- */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
      >
        <Module id="MODULE_A1 · UPLOAD" badge="Init">
          {parsing ? (
            <div className="flex items-center justify-center gap-3 py-16">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
              <span className="label">Parsing CSV…</span>
            </div>
          ) : (
            <Dropzone onFile={onFile} />
          )}

          {/* Sample loaders — inline, no forced spacing */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-200/80 pt-3 dark:border-ink-700/60">
            <div className="label inline-flex shrink-0 items-center gap-1.5">
              <Zap className="h-3 w-3 text-amber-500" /> No file? Try a sample:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLES.map((s) => (
                <SampleChip
                  key={s.id}
                  sample={s}
                  disabled={parsing}
                  onClick={() => loadSample(s)}
                />
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink-200/80 pt-3 dark:border-ink-700/60">
            <div className="label inline-flex items-center gap-1.5">
              <Wand2 className="h-3 w-3" />
              Zero manual mapping · works on unfamiliar columns
            </div>
            <div className="label">
              Press <kbd className="kbd">↵</kbd> or drop a file
            </div>
          </div>
        </Module>
      </motion.div>

      {/* -------- FEATURE STRIP -------- */}
      <div className="grid gap-3 sm:grid-cols-3">
        {MODULES.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.14 + i * 0.05 }}
          >
            <Module id={m.id} className="h-full">
              <div className="flex items-start gap-3">
                <div className="rounded-control border border-amber-500/40 bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-500">
                  <m.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-serif text-lg leading-tight text-ink-900 dark:text-white">
                    {m.title}
                  </div>
                  <div className="mono mt-1">{m.body}</div>
                </div>
              </div>
            </Module>
          </motion.div>
        ))}
      </div>

      {/* -------- NUMBERS -------- */}
      <div className="grid gap-2 sm:grid-cols-4">
        <NumberStat value="15" label="Canonical CRM fields" />
        <NumberStat value="4" label="Enum-locked statuses" />
        <NumberStat value="5" label="Enum data sources" />
        <NumberStat value="<45s" label="Typical extract · 1k rows" />
      </div>
    </div>
  );
}

function NumberStat({ value, label }) {
  return (
    <div className="panel px-4 py-3">
      <div className="font-serif text-4xl leading-none text-ink-900 dark:text-white">{value}</div>
      <div className="label mt-2">{label}</div>
    </div>
  );
}

function SampleChip({ sample, disabled, onClick }) {
  const tone =
    sample.tone === 'brand'
      ? 'border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/15'
      : sample.tone === 'info'
        ? 'border-signal-info/60 bg-signal-info/10 text-signal-info hover:bg-signal-info/15'
        : sample.tone === 'ok'
          ? 'border-signal-ok/60 bg-signal-ok/10 text-signal-ok hover:bg-signal-ok/15'
          : 'border-signal-note/60 bg-signal-note/10 text-signal-note hover:bg-signal-note/15';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={sample.hint}
      className={cn(
        'group inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        tone
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100" />
      {sample.label}
      <span className="opacity-60">· {sample.rows} rows</span>
    </button>
  );
}

function TransformDemo() {
  return (
    <Module id="MODULE_A1 · DEMO" badge="Preview" tone="blood" className="flex-1">
      <div className="mb-2 flex items-center justify-between">
        <div className="label text-white/80">Source · Facebook Lead Export</div>
        <div className="label text-white/70">3 rows shown</div>
      </div>

      <div className="overflow-hidden rounded-card border border-white/10 bg-black/40">
        <div className="border-b border-white/10 bg-black/30 px-3 py-1.5 font-mono text-[10px] text-white/60">
          created_time,full_name,email,phone_number,ad_name,notes
        </div>
        <div className="space-y-1 px-3 py-2 font-mono text-[11px] leading-relaxed text-white/85">
          <div>2026-06-01T10:12:33+0000,Amit Sharma,amit@x.com,+91 98765 43201,Meridian Tower,3BHK ask</div>
          <div>2026-06-01T10:14:11+0000,Neha Gupta,neha@y.in,+919876543202,Eden Park,follow up Mon</div>
          <div className="opacity-75">2026-06-01T10:18:47+0000,Karan Mehta,,+91-987-654-3203,Sarjapur,wife's phone</div>
        </div>
      </div>

      <div className="my-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-white/15" />
        <span className="chip !border-amber-500/60 !bg-amber-500/25 !text-white">
          <Sparkles className="h-3 w-3" /> AI Extract <ArrowRight className="h-3 w-3" />
        </span>
        <div className="h-px flex-1 bg-white/15" />
      </div>

      <div className="space-y-1.5">
        {[
          { n: 'Amit Sharma', e: 'amit@x.com', p: '+91 · 9876543201', s: 'meridian_tower', st: 'GOOD_LEAD_FOLLOW_UP', tone: 'ok' },
          { n: 'Neha Gupta', e: 'neha@y.in', p: '+91 · 9876543202', s: 'eden_park', st: 'GOOD_LEAD_FOLLOW_UP', tone: 'ok' },
          { n: 'Karan Mehta', e: '—', p: '+91 · 9876543203', s: 'sarjapur_plots', st: 'DID_NOT_CONNECT', tone: 'info' },
        ].map((r) => (
          <div
            key={r.n}
            className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-card border border-white/10 bg-black/30 px-3 py-2"
          >
            <div className="min-w-0">
              <div className="truncate font-mono text-[13px] text-white">{r.n}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[10px] text-white/60">
                <span className="truncate">{r.e}</span>
                <span>·</span>
                <span>{r.p}</span>
                <span>·</span>
                <span className="chip !border-white/15 !bg-white/10 !text-white/85">{r.s}</span>
              </div>
            </div>
            <span
              className={
                'chip ' +
                (r.tone === 'ok'
                  ? '!border-signal-ok/60 !bg-signal-ok/20 !text-signal-ok'
                  : '!border-signal-info/60 !bg-signal-info/20 !text-signal-info')
              }
            >
              {r.st}
            </span>
          </div>
        ))}
      </div>
    </Module>
  );
}
