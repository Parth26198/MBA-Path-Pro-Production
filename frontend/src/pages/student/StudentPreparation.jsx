import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { PageState } from '@/components/shared/PageState';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function StudentPreparation() {
  const qc = useQueryClient();
  const [notes, setNotes] = useState({});

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: studentApi.dashboard,
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, taskNotes }) => studentApi.completePreparation(id, taskNotes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student-dashboard'] }),
  });

  const tasks = data?.data?.preparationTasks || [];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Preparation Tracking</h2>
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
        Mark tasks complete when done. Your trainer will verify completion.
      </p>

      <PageState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && tasks.length === 0}
        emptyTitle="No preparation tasks"
        emptyMessage="Your trainer will assign preparation tasks here."
        onRetry={refetch}
      >
        <div className="space-y-4">
          {tasks.map((t) => (
            <div key={t.id} className="rounded-2xl border bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-bold">{t.title}</h3>
                <Badge variant={t.status === 'verified' ? 'success' : t.status === 'completed' ? 'default' : 'warning'}>
                  {t.status}
                </Badge>
              </div>
              {t.description && <p className="mt-2 text-sm text-slate-600">{t.description}</p>}
              {t.trainer_remarks && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm">{t.trainer_remarks}</p>}
              {t.student_notes && <p className="mt-2 text-sm text-slate-500">Your notes: {t.student_notes}</p>}

              {['assigned', 'in_progress'].includes(t.status) && (
                <div className="mt-4 space-y-2">
                  <Label>Notes (optional)</Label>
                  <Input
                    value={notes[t.id] || ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [t.id]: e.target.value }))}
                    placeholder="What did you complete?"
                  />
                  <Button
                    size="sm"
                    onClick={() => completeMutation.mutate({ id: t.id, taskNotes: notes[t.id] })}
                    disabled={completeMutation.isPending}
                  >
                    {completeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Mark Complete</>}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
