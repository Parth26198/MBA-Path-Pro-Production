import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainerApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageState } from '@/components/shared/PageState';
import { CollegeForm } from '@/components/colleges/CollegeForm';
import { Plus, Pencil, Trash2, Send } from 'lucide-react';

export default function TrainerColleges() {
  const qc = useQueryClient();
  const [mode, setMode] = useState(null);
  const [editCollege, setEditCollege] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['trainer-colleges'],
    queryFn: () => trainerApi.colleges({ status: 'all' }),
  });

  const createMutation = useMutation({
    mutationFn: trainerApi.createCollege,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-colleges'] });
      setMode(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => trainerApi.updateCollege(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-colleges'] });
      setEditCollege(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: trainerApi.deleteCollege,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trainer-colleges'] }),
  });

  const submitMutation = useMutation({
    mutationFn: trainerApi.submitCollege,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trainer-colleges'] }),
  });

  const colleges = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">College Management</h2>
          <p className="text-sm text-slate-500">Manage colleges you created — draft, submit, or archive</p>
        </div>
        <Button onClick={() => { setMode('create'); setEditCollege(null); }}>
          <Plus className="h-4 w-4" /> Add College
        </Button>
      </div>

      {mode === 'create' && (
        <CollegeForm
          onSubmit={(payload) => createMutation.mutate(payload)}
          onCancel={() => setMode(null)}
          loading={createMutation.isPending}
          error={createMutation.error?.message}
        />
      )}

      {editCollege && (
        <CollegeForm
          initial={editCollege}
          onSubmit={(payload) => updateMutation.mutate({ id: editCollege.id, payload })}
          onCancel={() => setEditCollege(null)}
          loading={updateMutation.isPending}
          error={updateMutation.error?.message}
        />
      )}

      <PageState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && colleges.length === 0 && mode !== 'create'}
        emptyTitle="No colleges yet"
        emptyMessage="Create a college draft and submit it for admin approval."
        onRetry={refetch}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {colleges.map((c) => (
            <div key={c.id} className="rounded-2xl border bg-white p-5">
              <div className="flex justify-between gap-2">
                <h3 className="font-bold">{c.name}</h3>
                <Badge variant={c.status === 'published' ? 'success' : c.status === 'rejected' ? 'danger' : 'warning'}>
                  {c.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">{c.city || c.location || '—'}</p>
              {c.fees_min != null && (
                <p className="mt-2 text-sm">Fees: ₹{c.fees_min} – ₹{c.fees_max}</p>
              )}
              {c.avg_package != null && <p className="text-sm">Avg placement: ₹{c.avg_package} LPA</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditCollege(c); setMode(null); }}>
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
                {['draft', 'archived'].includes(c.status) && (
                  <Button size="sm" onClick={() => submitMutation.mutate(c.id)} disabled={submitMutation.isPending}>
                    <Send className="h-3 w-3" /> Submit
                  </Button>
                )}
                {['draft', 'archived', 'rejected'].includes(c.status) && (
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteMutation.mutate(c.id)}>
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
