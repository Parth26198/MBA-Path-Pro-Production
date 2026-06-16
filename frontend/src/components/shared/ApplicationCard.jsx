import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const statusVariant = (status) => {
  if (status?.includes('Review') || status?.includes('GDPI')) return 'warning';
  if (status?.includes('Pending')) return 'danger';
  if (status?.includes('Admitted')) return 'success';
  return 'default';
};

export function ApplicationCard({ application, readOnly = true, timelineLimit = 3 }) {
  const completed = application.checklist?.filter((c) => c.is_completed).length || 0;
  const total = application.checklist?.length || 1;
  const progress = (completed / total) * 100;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{application.college_name}</CardTitle>
          <p className="text-sm text-slate-500">{application.location}</p>
        </div>
        <Badge variant={statusVariant(application.status)}>{application.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>Checklist Progress</span>
            <span>{completed}/{total}</span>
          </div>
          <Progress value={progress} />
        </div>
        <ul className="space-y-2">
          {application.checklist?.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-sm">
              {item.is_completed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300" />
              )}
              <span className={item.is_completed ? 'text-slate-600' : 'text-slate-800'}>{item.title}</span>
            </li>
          ))}
        </ul>
        {application.trainer_remarks && (
          <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            <strong>Trainer Remarks:</strong> {application.trainer_remarks}
          </div>
        )}
        {application.timeline?.length > 0 && (
          <div className="border-t pt-3">
            <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-slate-500">
              <Clock className="h-3 w-3" /> Timeline
            </p>
            <ul className="space-y-2">
              {application.timeline.slice(0, timelineLimit).map((t) => (
                <li key={t.id} className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{t.title}</span>
                  {t.actor_name && (
                    <span className="ml-1 text-xs text-slate-400">· {t.actor_name}</span>
                  )}
                  <span className="block text-xs text-slate-500">{t.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {readOnly && (
          <p className="text-xs italic text-slate-400">Progress updates are managed by your trainer</p>
        )}
      </CardContent>
    </Card>
  );
}
