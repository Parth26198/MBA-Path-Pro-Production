import { Link } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function MbaJourneyProgress({ journey }) {
  if (!journey) return null;

  return (
    <div className="student-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Journey</p>
          <h3 className="feed-section-title mt-1">Your MBA progress</h3>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-brand-600">{journey.percent}%</p>
          <p className="text-xs text-slate-500">complete</p>
        </div>
      </div>
      <Progress value={journey.percent} className="mt-4 h-2" />
      <ul className="mt-5 space-y-2">
        {journey.steps?.map((step) => (
          <li key={step.id} className="flex items-center gap-2 text-sm">
            {step.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success-500" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-slate-300" />
            )}
            <span className={step.done ? 'text-slate-500 line-through' : 'font-medium text-slate-800'}>{step.label}</span>
          </li>
        ))}
      </ul>
      {journey.current_step && !journey.current_step.done && (
        <p className="mt-4 text-xs text-slate-500">
          Next step: <span className="font-semibold text-brand-700">{journey.current_step.label}</span>
        </p>
      )}
      <Button variant="outline" size="sm" className="mt-4" asChild>
        <Link to="/student/packages">View Journey Packages</Link>
      </Button>
    </div>
  );
}
