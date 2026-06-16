import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trainerApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { CheckCircle2, MessageSquare, Clock } from 'lucide-react';

export function TrainerApplicationPanel({ application }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState(application.status || 'Draft');
  const [remarks, setRemarks] = useState(application.trainer_remarks || '');
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineDesc, setTimelineDesc] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus(application.status || 'Draft');
    setRemarks(application.trainer_remarks || '');
  }, [application.id, application.status, application.trainer_remarks, application.updated_at]);

  const { data: statusesRes } = useQuery({
    queryKey: ['application-statuses'],
    queryFn: trainerApi.applicationStatuses,
  });
  const statuses = statusesRes?.data || [
    'Draft', 'Documents Pending', 'Under Review', 'GDPI Preparation',
    'Interview Scheduled', 'Admitted', 'Rejected', 'Withdrawn',
  ];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['trainer-applications'] });
    qc.invalidateQueries({ queryKey: ['trainer-dashboard'] });
  };

  const updateMutation = useMutation({
    mutationFn: (data) => trainerApi.updateApplication(application.id, data),
    onSuccess: () => {
      setMessage('Application updated');
      setError('');
      invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const checklistMutation = useMutation({
    mutationFn: ({ itemId, is_completed }) =>
      trainerApi.updateChecklist(itemId, { is_completed, completed_by_trainer: true }),
    onSuccess: () => {
      setMessage('Checklist item updated');
      invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const timelineMutation = useMutation({
    mutationFn: (data) => trainerApi.addTimeline(data),
    onSuccess: () => {
      setTimelineTitle('');
      setTimelineDesc('');
      setMessage('Timeline entry added');
      invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const handleSaveUpdates = () => {
    updateMutation.mutate({
      status,
      trainer_remarks: remarks,
    });
  };

  const handleAddTimeline = (e) => {
    e.preventDefault();
    if (!timelineTitle.trim()) {
      setError('Timeline title is required');
      return;
    }
    timelineMutation.mutate({
      application_id: application.id,
      student_id: application.student_id,
      title: timelineTitle.trim(),
      description: timelineDesc.trim(),
      event_type: 'general',
    });
  };

  return (
    <div className="rounded-xl border bg-white p-4 space-y-4">
      <p className="text-xs font-semibold uppercase text-slate-500">
        Trainer Actions · {application.student_name}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`status-${application.id}`}>Application Status</Label>
          <select
            id={`status-${application.id}`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor={`remarks-${application.id}`}>Trainer Remarks</Label>
          <Textarea
            id={`remarks-${application.id}`}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add feedback or notes for the student..."
            className="mt-1 min-h-[44px]"
          />
        </div>
      </div>

      <Button
        size="sm"
        onClick={handleSaveUpdates}
        disabled={updateMutation.isPending}
      >
        <MessageSquare className="mr-1 h-3 w-3" />
        {updateMutation.isPending ? 'Saving...' : 'Save Status & Remarks'}
      </Button>

      <div className="border-t pt-3">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Checklist</p>
        <div className="flex flex-wrap gap-2">
          {application.checklist?.filter((c) => !c.is_completed).map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant="outline"
              onClick={() => checklistMutation.mutate({ itemId: item.id, is_completed: true })}
              disabled={checklistMutation.isPending}
            >
              <CheckCircle2 className="mr-1 h-3 w-3" /> Complete: {item.title}
            </Button>
          ))}
          {!application.checklist?.some((c) => !c.is_completed) && (
            <p className="text-xs text-emerald-600">All checklist items completed</p>
          )}
        </div>
      </div>

      <form onSubmit={handleAddTimeline} className="border-t pt-3 space-y-2">
        <p className="flex items-center gap-1 text-xs font-semibold uppercase text-slate-500">
          <Clock className="h-3 w-3" /> Add Timeline Entry
        </p>
        <Input
          placeholder="Event title (e.g. SOP reviewed)"
          value={timelineTitle}
          onChange={(e) => setTimelineTitle(e.target.value)}
        />
        <Textarea
          placeholder="Description (optional)"
          value={timelineDesc}
          onChange={(e) => setTimelineDesc(e.target.value)}
          className="min-h-[60px]"
        />
        <Button type="submit" size="sm" variant="secondary" disabled={timelineMutation.isPending}>
          Add to Timeline
        </Button>
      </form>

      {message && <p className="text-xs text-emerald-600">{message}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
