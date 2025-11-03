import { cn } from '../../lib/cn.js';

export function Tabs({ value, onChange, tabs }) {
  return (
    <div
      role="tablist"
      className="inline-flex gap-0 rounded-control border border-ink-200/80 bg-white/70 p-0.5 dark:border-ink-700/60 dark:bg-ink-800/70"
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            type="button"
            className={cn(
              'inline-flex items-center gap-2 rounded-[3px] px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-all',
              active
                ? 'bg-amber-500 text-ink-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_0_-1px_0_0_rgba(0,0,0,0.2)]'
                : 'text-ink-500 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white'
            )}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span
                className={cn(
                  'rounded-[3px] px-1 py-0.5 text-[9px] font-medium',
                  active
                    ? 'bg-ink-950/25 text-ink-950'
                    : 'bg-ink-200 text-ink-600 dark:bg-ink-700/70 dark:text-ink-200'
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
