import { cn } from '../../lib/cn.js';

export function StatPill({ icon: Icon, label, value, tone = 'neutral', className }) {
  const tones = {
    neutral: 'text-ink-500 dark:text-ink-300',
    good: 'text-signal-ok',
    warn: 'text-signal-warn',
    bad: 'text-signal-bad',
    brand: 'text-amber-600 dark:text-amber-500',
    info: 'text-signal-info',
  };
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-pill border px-2.5 py-1',
        'border-ink-200/80 bg-white/80 dark:border-ink-700/60 dark:bg-ink-800/70',
        className
      )}
    >
      {Icon ? <Icon className={cn('h-3 w-3', tones[tone])} /> : null}
      <span className="label">{label}</span>
      <span className="font-mono text-[11px] font-medium text-ink-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}
