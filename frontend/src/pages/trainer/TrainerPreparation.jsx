import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainerApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { PageState } from '@/components/shared/PageState';
import { Plus, Loader2 } from 'lucide-react';

export default function TrainerPreparation() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: '', title: '', description: '', due_date: '' });

  const { data: studentsRes } = useQuery({ queryKey: ['trainer-students'], queryFn: trainerApi.students });
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['trainer-prep'],
    queryFn: () => trainerApi.preparation(),
  });

  const createMutation = useMutation({
    mutationFn: trainerApi.createPreparation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-prep'] });
      setShowForm(false);
      setForm({ student_id: '', title: '', description: '', due_date: '' });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id }) => trainerApi.updatePreparation(id, { status: 'verified' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trainer-prep'] }),
  });

  const tasks = data?.data || [];
  const students = studentsRes?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">Preparation Tracking</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Create Task
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ ...form, student_id: parseInt(form.student_id, 10) });
          }}
          className="rounded-2xl border bg-white p-6 space-y-4"
        >
          <div>
            <Label>Student</Label>
            <select
              required
              className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Title</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label>Due Date</Label>
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          {createMutation.isError && <p className="text-sm text-red-600">{createMutation.error.message}</p>}
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Task'}
          </Button>
        </form>
      )}

      <PageState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && tasks.length === 0}
        emptyTitle="No preparation tasks"
        emptyMessage="Create tasks to track student MBA preparation."
        onRetry={refetch}
      >
        <div className="space-y-4">
          {tasks.map((t) => (
            <div key={t.id} className="rounded-2xl border bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-bold">{t.title}</h3>
                <Badge variant={t.status === 'verified' ? 'success' : 'warning'}>{t.status}</Badge>
              </div>
              <p className="text-sm text-slate-500">Student: {t.student_name}</p>
              {t.student_notes && <p className="mt-2 text-sm">Student notes: {t.student_notes}</p>}
              {t.trainer_remarks && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm">{t.trainer_remarks}</p>}
              {t.status === 'completed' && (
                <Button size="sm" className="mt-3" onClick={() => verifyMutation.mutate({ id: t.id })} disabled={verifyMutation.isPending}>
                  Verify Completion
                </Button>
              )}
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
