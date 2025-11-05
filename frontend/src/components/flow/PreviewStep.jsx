import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileSpreadsheet,
  Columns3,
  Rows3,
  Sparkles,
  AlertTriangle,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Module } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { StatPill } from '../ui/StatPill.jsx';
import { DataTable } from '../shared/DataTable.jsx';
import { humanBytes } from '../../lib/csv.js';
import { cn } from '../../lib/cn.js';

export function PreviewStep({ parse, file, onConfirm, onCancel }) {
  const {
    columns = [],
    previewRows = [],
    rowCount = 0,
    previewTruncated = false,
    fileName,
  } = parse ?? {};

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative mx-auto w-full max-w-[1400px]"
    >
      <div
        className={cn(
          'grid gap-4 transition-[grid-template-columns] duration-300 ease-out',
          sidebarOpen ? 'lg:grid-cols-[320px_1fr]' : 'lg:grid-cols-[0_1fr]'
        )}
      >
        {/* --- Sidebar --- */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 lg:overflow-hidden"
            >
              <Module
                id="MODULE_A2 · FILE"
                badge="Loaded"
                right={
                  <button
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Collapse sidebar"
                    className="btn-ghost h-7 !p-0 w-7"
                    type="button"
                    title="Collapse sidebar"
                  >
                    <PanelLeftClose className="h-3.5 w-3.5" />
                  </button>
                }
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-control border border-amber-500/40 bg-amber-500/10 p-2 text-amber-600 dark:text-amber-500">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-[13px] text-ink-900 dark:text-white">
                      {fileName || file?.name}
                    </div>
                    <div className="label mt-0.5">{humanBytes(file?.size)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <StatPill icon={Rows3} label="Rows" value={rowCount.toLocaleString()} tone="brand" />
                  <StatPill icon={Columns3} label="Cols" value={columns.length} tone="brand" />
                </div>
              </Module>

              <Module id="MODULE_A2 · NEXT">
                <ol className="space-y-3">
                  {[
                    'Split rows into batches and stream them to the LLM.',
                    'Map each source column into canonical CRM fields.',
                    'Validate every value, absorb extras into crm_note, skip contact-less rows.',
                  ].map((t, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-control border border-amber-500/50 bg-amber-500/10 font-mono text-[10px] font-medium text-amber-600 dark:text-amber-500">
                        0{i + 1}
                      </span>
                      <span className="mono">{t}</span>
                    </li>
                  ))}
                </ol>
              </Module>

              {previewTruncated && (
                <div className="rounded-card border border-signal-warn/40 bg-signal-warn/[0.06] p-3">
                  <div className="mb-1 label-strong inline-flex items-center gap-1.5 text-signal-warn">
                    <AlertTriangle className="h-3.5 w-3.5" /> Preview capped
                  </div>
                  <div className="mono">
                    Showing first 100 rows. All{' '}
                    <span className="text-ink-900 dark:text-white">
                      {rowCount.toLocaleString()}
                    </span>{' '}
                    rows will be processed on confirm.
                  </div>
                </div>
              )}

              <div className="hidden lg:block">
                <div className="rounded-card border border-dashed border-ink-200/70 p-3 dark:border-ink-700/60">
                  <div className="mb-1 label-strong inline-flex items-center gap-1.5">
                    <Info className="h-3 w-3" /> Tip
                  </div>
                  <div className="mono">
                    Tables auto-fit. Hit{' '}
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="underline decoration-dotted underline-offset-2 hover:text-amber-600 dark:hover:text-amber-500"
                      type="button"
                    >
                      collapse
                    </button>{' '}
                    for a fuller table view.
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* --- Preview + CTA --- */}
        <div className="min-w-0 space-y-3">
          <Module
            id="MODULE_A2 · PREVIEW"
            badge="Read-only"
            right={
              <div className="flex items-center gap-2">
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Show sidebar"
                    type="button"
                    title="Show sidebar"
                    className="btn-ghost h-7 gap-1.5 !px-2"
                  >
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Details</span>
                  </button>
                )}
                <div className="label">
                  {Math.min(previewRows.length, 100).toLocaleString()} /{' '}
                  {rowCount.toLocaleString()}
                </div>
              </div>
            }
          >
            <DataTable columns={columns} rows={previewRows} height="min(580px, 62vh)" />
          </Module>

          <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-card border border-ink-200/80 bg-white/85 p-3 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/85">
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4" /> Choose another
            </Button>
            <div className="flex items-center gap-3">
              <div className="label hidden sm:inline">↵ to confirm</div>
              <Button variant="primary" className="btn-lg" onClick={onConfirm}>
                <Sparkles className="h-4 w-4" /> Confirm &amp; Extract
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
