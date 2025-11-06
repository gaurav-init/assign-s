import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Search,
  PartyPopper,
} from 'lucide-react';
import { Module } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { Tabs } from '../ui/Tabs.jsx';
import { DataTable } from '../shared/DataTable.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { CRM_FIELDS } from '../../constants/crm.js';
import { downloadFile, recordsToCsv } from '../../lib/csv.js';
import { cn } from '../../lib/cn.js';

const SKIPPED_COLUMNS = ['rowIndex', 'reason'];

const SPECTRUM = [
  { name: 'Green', hex: '#5EBD3E' },
  { name: 'Yellow', hex: '#FFB900' },
  { name: 'Orange', hex: '#F78200' },
  { name: 'Red', hex: '#E23838' },
  { name: 'Purple', hex: '#973999' },
  { name: 'Blue', hex: '#009CDF' },
];

export function ResultsStep({ result, onReset }) {
  const [tab, setTab] = useState('imported');
  const [query, setQuery] = useState('');

  const imported = result?.imported ?? [];
  const skipped = result?.skipped ?? [];
  const counts = result?.counts ?? { imported: 0, skipped: 0, total: 0 };
  const batches = result?.batches ?? { total: 0, succeeded: 0, failed: 0, retries: 0 };

  const filteredImported = useMemo(
    () => filterRows(imported, query, CRM_FIELDS),
    [imported, query]
  );
  const filteredSkipped = useMemo(
    () => filterRows(skipped, query, SKIPPED_COLUMNS),
    [skipped, query]
  );

  const successRate = counts.total ? Math.round((counts.imported / counts.total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-[1400px] space-y-4"
    >
      <Module
        id="MODULE_A4 · RESULTS"
        badge="Complete"
        tone="blood"
        right={
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="outline"
              onClick={() =>
                downloadFile(
                  'groweasy-leads.json',
                  JSON.stringify(imported, null, 2),
                  'application/json'
                )
              }
            >
              <Download className="h-3.5 w-3.5" /> JSON
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                downloadFile('groweasy-leads.csv', recordsToCsv(imported), 'text/csv')
              }
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button variant="primary" onClick={onReset}>
              <RefreshCcw className="h-3.5 w-3.5" /> Import another
            </Button>
          </div>
        }
      >
        <div className="mb-5">
          <div className="label-strong text-white/85 mb-2 inline-flex items-center gap-2">
            <PartyPopper className="h-3.5 w-3.5 text-amber-500" /> Extraction complete
          </div>
          <h2 className="font-serif text-4xl leading-tight text-white">
            <span className="text-amber-500">{counts.imported.toLocaleString()}</span> leads ready
            for GrowEasy.
          </h2>
          <p className="mt-1 font-serif text-base text-white/75">
            {successRate}% success · {batches.total} batches
            {batches.retries > 0 && ` · ${batches.retries} retries`}
            {batches.failed > 0 && ` · ${batches.failed} failed`}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          <SummaryStat icon={CheckCircle2} label="Imported" value={counts.imported} tone="ok" hint="valid CRM records" />
          <SummaryStat icon={XCircle} label="Skipped" value={counts.skipped} tone="bad" hint="missing contact info" />
          <SummaryStat icon={Sparkles} label="Batches" value={batches.total} tone="brand" hint={`${batches.succeeded} ok · ${batches.failed} failed`} />
          <SummaryStat icon={RefreshCw} label="Retries" value={batches.retries} tone="warn" hint="transient failures recovered" />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <div className="label text-white/80">Chroma · Spectrum</div>
          <div className="flex flex-wrap gap-1.5">
            {SPECTRUM.map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-1.5 rounded-pill border border-white/15 bg-black/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-white/90"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: s.hex, boxShadow: `0 0 6px 0 ${s.hex}80` }}
                />
                {s.name}
                <span className="text-white/50">{s.hex}</span>
              </span>
            ))}
          </div>
        </div>
      </Module>

      <Module
        id="MODULE_A4 · TABLE"
        right={
          <label className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter rows…"
              className="w-56 rounded-control border border-ink-200/80 bg-white/80 py-1.5 pl-8 pr-3 font-mono text-[12px] text-ink-800 outline-none placeholder:text-ink-400 focus:border-amber-500/60 dark:border-ink-700/60 dark:bg-ink-900/60 dark:text-white"
            />
          </label>
        }
      >
        <div className="mb-3">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'imported', label: 'Imported', count: counts.imported },
              { value: 'skipped', label: 'Skipped', count: counts.skipped },
            ]}
          />
        </div>

        {tab === 'imported' ? (
          <DataTable
            columns={CRM_FIELDS}
            rows={filteredImported}
            highlightStatus
            height="min(640px, 65vh)"
            emptyState={
              <EmptyState
                icon={CheckCircle2}
                title="No records match this filter"
                description="Try a different search term or clear the filter."
              />
            }
          />
        ) : (
          <DataTable
            columns={SKIPPED_COLUMNS}
            rows={filteredSkipped}
            height="min(640px, 65vh)"
            emptyState={
              <EmptyState
                icon={CheckCircle2}
                title="Nothing was skipped"
                description="Every row in your CSV had usable contact info."
              />
            }
          />
        )}
      </Module>
    </motion.div>
  );
}

function SummaryStat({ icon: Icon, label, value, tone, hint }) {
  const tones = {
    ok: 'text-signal-ok bg-signal-ok/10 border-signal-ok/40',
    bad: 'text-signal-bad bg-signal-bad/10 border-signal-bad/40',
    warn: 'text-signal-warn bg-signal-warn/10 border-signal-warn/40',
    brand: 'text-amber-500 bg-amber-500/10 border-amber-500/40',
  };
  return (
    <div className="rounded-card border border-white/10 bg-black/25 p-3">
      <div className="flex items-center gap-2.5">
        <div className={cn('rounded-[3px] border p-1.5', tones[tone])}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <div className="label text-white/70">{label}</div>
          <div className="font-mono text-xl font-medium text-white">
            {Number(value).toLocaleString()}
          </div>
        </div>
      </div>
      {hint ? <div className="label mt-2 text-white/60">{hint}</div> : null}
    </div>
  );
}

function filterRows(rows, query, cols) {
  if (!query) return rows;
  const q = query.toLowerCase();
  return rows.filter((r) => cols.some((c) => String(r?.[c] ?? '').toLowerCase().includes(q)));
}
