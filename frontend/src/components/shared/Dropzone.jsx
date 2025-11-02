import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileSpreadsheet, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { humanBytes } from '../../lib/csv.js';

const MAX_MB = 10;

export function Dropzone({ onFile }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const validate = useCallback((file) => {
    if (!file) return 'No file selected';
    const okType =
      file.name.toLowerCase().endsWith('.csv') ||
      file.type === 'text/csv' ||
      file.type === 'application/vnd.ms-excel';
    if (!okType) return 'Only .csv files are accepted';
    if (file.size > MAX_MB * 1024 * 1024) return `File exceeds ${MAX_MB} MB limit`;
    return null;
  }, []);

  const submit = useCallback(
    (file) => {
      const err = validate(file);
      if (err) return setError(err);
      setError(null);
      onFile(file);
    },
    [onFile, validate]
  );

  return (
    <div className="space-y-3">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label="Upload CSV"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          submit(e.dataTransfer.files?.[0]);
        }}
        initial={false}
        animate={{ scale: dragging ? 1.005 : 1 }}
        className={cn(
          'group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border border-dashed px-6 py-8 text-center transition-colors',
          'border-ink-300/70 bg-white/50 hover:border-amber-500/60',
          'dark:border-ink-700/70 dark:bg-ink-900/40',
          dragging && 'border-amber-500 glow-amber'
        )}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-control text-ink-950"
          style={{
            background: 'linear-gradient(180deg, #ffd04a 0%, #ffb900 60%, #d99a00 100%)',
            boxShadow:
              'inset 0 1px 0 0 rgba(255,255,255,0.35), inset 0 -1px 0 0 rgba(0,0,0,0.35)',
          }}
        >
          <UploadCloud className="h-5 w-5" strokeWidth={2.25} />
        </div>

        <div className="space-y-1">
          <div className="font-serif text-xl leading-tight text-ink-900 dark:text-white sm:text-2xl">
            Drop your CSV file here
          </div>
          <div className="label">
            or <span className="text-amber-600 dark:text-amber-500">click to browse</span>
            <span className="mx-1.5 text-ink-300 dark:text-ink-700">·</span>
            drag &amp; drop
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 label">
          <span className="inline-flex items-center gap-1">
            <FileSpreadsheet className="h-3 w-3" /> .CSV
          </span>
          <span className="h-1 w-1 rounded-full bg-ink-300 dark:bg-ink-700" />
          <span>Max {humanBytes(MAX_MB * 1024 * 1024)}</span>
          <span className="h-1 w-1 rounded-full bg-ink-300 dark:bg-ink-700" />
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-500" />
            AI maps columns automatically
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv,application/vnd.ms-excel"
          className="sr-only"
          onChange={(e) => submit(e.target.files?.[0])}
        />
      </motion.div>

      {error && (
        <div
          role="alert"
          className="inline-flex items-center gap-2 rounded-control border border-signal-bad/40 bg-signal-bad/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-signal-bad"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
