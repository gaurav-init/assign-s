import { cn } from '../../lib/cn.js';

export function Button({ variant = 'primary', className, children, ...props }) {
  const cls =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'outline'
        ? 'btn-outline'
        : 'btn-ghost';
  return (
    <button className={cn(cls, className)} {...props}>
      {children}
    </button>
  );
}
