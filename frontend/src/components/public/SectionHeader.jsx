import { cn } from '@/lib/utils';

export function SectionHeader({ eyebrow, title, subtitle, align = 'left', className }) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">{eyebrow}</p>
      )}
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-400 md:text-lg">{subtitle}</p>}
    </div>
  );
}
