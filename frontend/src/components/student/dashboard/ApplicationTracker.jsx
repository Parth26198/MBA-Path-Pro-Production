import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LABELS = {
  applied: 'Applied',
  in_review: 'In Review',
  interview: 'Interview',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const COLORS = {
  applied: 'bg-brand-500',
  in_review: 'bg-accent-500',
  interview: 'bg-warning-500',
  accepted: 'bg-success-500',
  rejected: 'bg-danger-500',
};

export function ApplicationTracker({ stats }) {
  const entries = Object.entries(stats || {});
  const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1;

  return (
    <div className="student-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Applications</p>
          <h3 className="feed-section-title mt-1">Application tracker</h3>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/student/applications">View all</Link>
        </Button>
      </div>
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
        {entries.map(([key, count]) =>
          count > 0 ? (
            <div key={key} className={COLORS[key]} style={{ width: `${(count / total) * 100}%` }} title={`${LABELS[key]}: ${count}`} />
          ) : null
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {entries.map(([key, count]) => (
          <div key={key} className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="font-display text-xl font-bold text-slate-900">{count}</p>
            <p className="text-xs text-slate-500">{LABELS[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
