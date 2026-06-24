import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HorizontalCarousel({ children, className, title, subtitle, action }) {
  const ref = useRef(null);

  const scroll = (dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section className={cn('space-y-5', className)}>
      {(title || action) && (
        <div className="flex items-end justify-between gap-4">
          <div>
            {title && <h3 className="feed-section-title">{title}</h3>}
            {subtitle && <p className="feed-section-subtitle">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {action}
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <div ref={ref} className="carousel-scroll flex gap-5 overflow-x-auto pb-2">
        {children}
      </div>
    </section>
  );
}
