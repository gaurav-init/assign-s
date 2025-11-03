import { cn } from '../../lib/cn.js';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-16 text-center',
        className
      )}
    >
      {Icon ? (
        <div className="mb-1 rounded-control border border-ink-700/60 bg-ink-800/60 p-3 text-ink-300">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <div className="font-serif text-lg text-white">{title}</div>
      {description ? (
        <div className="mono max-w-sm text-ink-300">{description}</div>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
