import { cn } from '@/lib/utils';

export function Progress({ value = 0, className }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}
