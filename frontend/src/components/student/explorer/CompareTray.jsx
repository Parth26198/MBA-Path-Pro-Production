import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompareStore } from '@/store/compareStore';

export function CompareTray() {
  const items = useCompareStore((s) => (Array.isArray(s.items) ? s.items : []));
  const { remove, clear } = useCompareStore();
  if (items.length === 0) return null;

  const ids = items.map((u) => u.id).join(',');

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-slate-200 bg-white/90 p-4 backdrop-blur-xl lg:bottom-0 lg:left-[260px]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Compare ({items.length}/3)</span>
          {items.map((u) => (
            <span key={u.id} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {u.name}
              <button type="button" onClick={() => remove(u.id)} aria-label="Remove">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
          <Button variant="premium" size="sm" asChild disabled={items.length < 2}>
            <Link to={`/student/universities/compare?ids=${ids}`}>Compare Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
