import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEADLINES = [
  { school: 'IIM Ahmedabad', program: 'PGP', date: 'Jan 15, 2027', daysLeft: 212 },
  { school: 'ISB Hyderabad', program: 'PGP', date: 'Feb 28, 2027', daysLeft: 256 },
  { school: 'XLRI Jamshedpur', program: 'PGDM', date: 'Dec 31, 2026', daysLeft: 197 },
];

export function UpcomingDeadlinesPreview() {
  return (
    <div className="student-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">Application Tracker</p>
          <h3 className="feed-section-title mt-1">Upcoming Deadlines</h3>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/student/applications">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <ul className="mt-5 space-y-3">
        {DEADLINES.map((d) => (
          <li
            key={d.school}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{d.school}</p>
              <p className="text-xs text-slate-500">{d.program}</p>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-1 text-sm font-bold text-slate-900 dark:text-white">
                <Calendar className="h-3.5 w-3.5 text-[#4F46E5]" />
                {d.date}
              </p>
              <p className="text-xs font-semibold text-[#16A34A]">{d.daysLeft} days left</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
