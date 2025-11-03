import { cn } from '../../lib/cn.js';

export function Card({ className, ...props }) {
  return <div className={cn('panel', className)} {...props} />;
}

/**
 * Module card — the signature Skeuomorphic-Clean pattern.
 *  ┌ MODULE_ID · badge ────── kebab ┐
 *  │ …body…                          │
 *  └─────────────────────────────────┘
 */
export function Module({ id, badge, right, className, children, tone = 'default' }) {
  return (
    <section
      className={cn(tone === 'blood' ? 'panel-blood' : 'panel', 'overflow-hidden', className)}
    >
      <header className="module-header">
        <div className="flex items-center gap-2">
          <span className="module-id">{id}</span>
          {badge ? (
            <span className="chip border-amber-500/40 text-amber-500">{badge}</span>
          ) : null}
        </div>
        {right}
      </header>
      <div className="module-body">{children}</div>
    </section>
  );
}
