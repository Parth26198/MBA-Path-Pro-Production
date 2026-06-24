import { Link } from 'react-router-dom';
import { FileText, Lock, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudentTier } from '@/hooks/useStudentTier';

const ICONS = { guide: FileText, template: FileText, video: Video };

export function ResourcesPreview({ resources }) {
  const { isPremium } = useStudentTier();
  const items = resources || [];

  return (
    <div className="student-card h-full p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">Resources</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/student/resources">View all</Link>
        </Button>
      </div>
      <ul className="mt-4 space-y-2">
        {items.slice(0, 5).map((r) => {
          const Icon = ICONS[r.type] || FileText;
          const locked = r.is_premium && !isPremium;
          return (
            <li key={r.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4 text-brand-600" />
                <span className={locked ? 'text-slate-400' : 'text-slate-800'}>{r.title}</span>
              </div>
              {locked && <Lock className="h-3.5 w-3.5 text-slate-400" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
