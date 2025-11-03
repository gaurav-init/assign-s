import { cn } from '../../lib/cn.js';

const STEPS = [
  { id: 'upload', label: 'A1 · Upload' },
  { id: 'preview', label: 'A2 · Preview' },
  { id: 'extract', label: 'A3 · Extract' },
  { id: 'results', label: 'A4 · Results' },
];

const activeFor = (step) => {
  if (step === 'idle' || step === 'parsing' || step === 'error') return 0;
  if (step === 'preview') return 1;
  if (step === 'extracting') return 2;
  return 3;
};

export function StepIndicator({ step }) {
  const active = activeFor(step);
  return (
    <ol className="flex items-center gap-1 text-[10px]">
      {STEPS.map((s, i) => {
        const done = i < active;
        const now = i === active;
        return (
          <li key={s.id} className="flex items-center">
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-control border px-2 py-1 font-mono uppercase tracking-[0.1em] transition-colors',
                done && 'border-signal-ok/50 bg-signal-ok/10 text-signal-ok',
                now && 'border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-500',
                !done && !now &&
                  'border-ink-200/80 bg-white/60 text-ink-500 dark:border-ink-700/60 dark:bg-ink-800/40 dark:text-ink-400'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  done && 'bg-signal-ok',
                  now && 'animate-blip bg-amber-500',
                  !done && !now && 'bg-ink-300 dark:bg-ink-600'
                )}
              />
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px w-3 bg-ink-200 dark:bg-ink-700/60" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
