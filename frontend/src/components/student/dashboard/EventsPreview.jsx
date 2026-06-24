import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EventsPreview({ sessions }) {
  const items = sessions || [];

  return (
    <div className="student-card h-full p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">Upcoming Events</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/student/events">View all</Link>
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No upcoming sessions scheduled yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.slice(0, 4).map((s) => (
            <li key={s.id} className="flex gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{s.title || s.session_type}</p>
                <p className="text-xs text-slate-500">
                  {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : 'TBD'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
