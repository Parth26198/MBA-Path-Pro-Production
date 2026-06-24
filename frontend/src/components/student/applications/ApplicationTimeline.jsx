import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGE_ORDER = [
  'Profile Created',
  'Package Activated',
  'Application Submitted',
  'Application Reviewed',
  'Interview Scheduled',
  'Offer Received',
  'Admission Confirmed',
];

export function ApplicationTimeline({ events, limit, className }) {
  const items = (events || []).slice(0, limit || events?.length);
  if (!items.length) {
    return <p className="text-sm text-slate-500">No timeline events yet.</p>;
  }

  return (
    <div className={cn('relative space-y-0', className)}>
      {items.map((event, i) => {
        const isCompleted = event.status === 'completed';
        const isCurrent = event.status === 'current';
        const Icon = isCompleted ? CheckCircle2 : isCurrent ? Clock : Circle;

        return (
          <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
            {i < items.length - 1 && (
              <div className="absolute left-[11px] top-6 h-full w-0.5 bg-slate-200" />
            )}
            <div
              className={cn(
                'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                isCompleted && 'text-success-500',
                isCurrent && 'text-brand-600',
                !isCompleted && !isCurrent && 'text-slate-300'
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{event.stage}</p>
              <p className="font-semibold text-slate-900">{event.title}</p>
              {event.description && <p className="text-sm text-slate-600">{event.description}</p>}
              {event.at && (
                <p className="mt-1 text-xs text-slate-400">{new Date(event.at).toLocaleString()}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ApplicationTimelinePreview({ events }) {
  const sorted = [...(events || [])].sort((a, b) => {
    const ai = STAGE_ORDER.indexOf(a.stage);
    const bi = STAGE_ORDER.indexOf(b.stage);
    return ai - bi;
  });

  return (
    <div className="student-card p-6">
      <h3 className="font-display text-lg font-bold">Application Timeline</h3>
      <p className="mt-1 text-sm text-slate-500">Your admission journey at a glance</p>
      <div className="mt-6">
        <ApplicationTimeline events={sorted.slice(0, 6)} />
      </div>
    </div>
  );
}
