import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-brand-100 text-brand-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  muted: 'bg-slate-100 text-slate-700',
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)}
      {...props}
    />
  );
}
