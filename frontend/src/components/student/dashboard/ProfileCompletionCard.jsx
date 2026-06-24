import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function ProfileCompletionCard({ completion }) {
  const percent = completion?.percent ?? 0;
  const missing = completion?.missing ?? [];

  return (
    <div className="student-card p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Profile</p>
      <h3 className="feed-section-title mt-1">Complete your profile</h3>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeDasharray={`${percent} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-brand-700">
            {percent}%
          </span>
        </div>
        <div className="min-w-0 flex-1">
          {missing.length > 0 ? (
            <ul className="space-y-1 text-sm text-slate-600">
              {missing.slice(0, 3).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-success-700">Your profile looks great!</p>
          )}
        </div>
      </div>
      <Button className="mt-4 w-full" variant="default" asChild>
        <Link to="/student/profile">Complete Profile</Link>
      </Button>
    </div>
  );
}
