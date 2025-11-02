import { cn } from '../../lib/cn.js';

export function Badge({ className, children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-ink-700/60 text-ink-200 bg-ink-800/70',
    good: 'border-signal-ok/50 text-signal-ok bg-signal-ok/10',
    warn: 'border-signal-warn/50 text-signal-warn bg-signal-warn/10',
    bad: 'border-signal-bad/50 text-signal-bad bg-signal-bad/10',
    accent: 'border-signal-note/50 text-signal-note bg-signal-note/10',
    brand: 'border-amber-500/50 text-amber-500 bg-amber-500/10',
    info: 'border-signal-info/50 text-signal-info bg-signal-info/10',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]',
        tones[tone] ?? tones.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
