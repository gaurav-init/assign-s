import { cn } from '../../lib/cn.js';

export function ProgressBar({ value, className }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        'relative h-1.5 w-full overflow-hidden rounded-pill border',
        'border-ink-200/80 bg-ink-100',
        'dark:border-ink-700/60 dark:bg-ink-800',
        className
      )}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-pill transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #FFB900 0%, #F78200 100%)',
          boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.35)',
        }}
      />
    </div>
  );
}
