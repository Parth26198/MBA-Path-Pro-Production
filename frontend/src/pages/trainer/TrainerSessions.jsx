import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainerApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { PageState } from '@/components/shared/PageState';
import { Plus, Loader2 } from 'lucide-react';

const typeLabels = {
  google_meet: 'Google Meet',
  phone_call: 'Phone Call',
  mock_interview: 'Mock Interview',
  gd_practice: 'GD Practice',
  counseling: 'Counseling',
};

export default function TrainerSessions() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    student_id: '',
    session_type: 'google_meet',
    title: '',
    scheduled_at: '',
    duration_minutes: 60,
    meet_link: '',
    notes: '',
  });

  const { data: studentsRes } = useQuery({ queryKey: ['trainer-students'], queryFn: trainerApi.students });
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['trainer-sessions'],
    queryFn: () => trainerApi.sessions(),
  });

  const createMutation = useMutation({
    mutationFn: trainerApi.createSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-sessions'] });
      setShowForm(false);
    },
  });

  const attendanceMutation = useMutation({
    mutationFn: ({ id, attendance }) => trainerApi.updateSession(id, { attendance }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trainer-sessions'] }),
  });

  const sessions = data?.data || [];
  const students = studentsRes?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">Sessions</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Schedule Session
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ ...form, student_id: parseInt(form.student_id, 10), duration_minutes: parseInt(form.duration_minutes, 10) });
          }}
          className="rounded-2xl border bg-white p-6 space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Student</Label>
              <select required className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                <option value="">Select student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Type</Label>
              <select className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={form.session_type} onChange={(e) => setForm({ ...form, session_type: e.target.value })}>
                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Date & Time</Label>
              <Input type="datetime-local" required value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
            </div>
            <div>
              <Label>Meet Link</Label>
              <Input value={form.meet_link} onChange={(e) => setForm({ ...form, meet_link: e.target.value })} placeholder="https://meet.google.com/..." />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Session'}
          </Button>
        </form>
      )}

      <PageState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && sessions.length === 0}
        emptyTitle="No sessions"
        emptyMessage="Schedule Google Meet, mock interviews, or GD sessions."
        onRetry={refetch}
      >
        <div className="space-y-4">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-2xl border bg-white p-6">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h3 className="font-bold">{s.title || typeLabels[s.session_type]}</h3>
                  <p className="text-sm text-slate-500">{s.student_name}</p>
                </div>
                <Badge variant={s.status === 'completed' ? 'success' : 'default'}>{s.status}</Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                <div><dt className="text-slate-500">Type</dt><dd>{typeLabels[s.session_type]}</dd></div>
                <div><dt className="text-slate-500">Date</dt><dd>{s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : '—'}</dd></div>
                <div><dt className="text-slate-500">Duration</dt><dd>{s.duration_minutes} min</dd></div>
                <div><dt className="text-slate-500">Attendance</dt><dd>{s.attendance || 'scheduled'}</dd></div>
              </dl>
              {s.notes && <p className="mt-3 text-sm"><strong>Notes:</strong> {s.notes}</p>}
              {s.meet_link && (
                <a href={s.meet_link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
                  Open Meet Link
                </a>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {['present', 'absent', 'late', 'excused'].map((a) => (
                  <Button key={a} size="sm" variant={s.attendance === a ? 'default' : 'outline'} onClick={() => attendanceMutation.mutate({ id: s.id, attendance: a })}>
                    {a}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
