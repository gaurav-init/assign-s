import { AlertOctagon, RefreshCcw } from 'lucide-react';
import { Module } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';

export function ErrorStep({ error, onReset }) {
  return (
    <div className="mx-auto max-w-lg">
      <Module id="MODULE_ERR · FAULT" badge="Halted">
        <div className="text-center">
          <div className="mx-auto mb-3 inline-flex rounded-control border border-signal-bad/50 bg-signal-bad/10 p-3 text-signal-bad">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl text-ink-900 dark:text-white">Something went wrong</h2>
          <p className="mono mt-1 break-words">{error?.message ?? 'Unknown error'}</p>
          {error?.code && (
            <div className="mt-3 inline-flex items-center gap-1 rounded-control border border-ink-200/80 bg-white/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-700 dark:border-ink-700/60 dark:bg-ink-800/70 dark:text-ink-200">
              {error.code}
            </div>
          )}
          <Button className="mt-6" variant="primary" onClick={onReset}>
            <RefreshCcw className="h-4 w-4" /> Start over
          </Button>
        </div>
      </Module>
    </div>
  );
}
