import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainerApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { PageState } from '@/components/shared/PageState';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export default function TrainerDocuments() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['trainer-documents', filter],
    queryFn: () => trainerApi.documents(filter ? { status: filter } : {}),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, approved, rejection_reason }) => trainerApi.verifyDocument(id, { approved, rejection_reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-documents'] });
      setRejectId(null);
      setRejectReason('');
    },
  });

  const docs = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">Student Documents</h2>
        <select className="h-9 rounded-lg border border-slate-200 px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <PageState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && docs.length === 0}
        emptyTitle="No documents"
        emptyMessage="Documents uploaded by your students will appear here."
        onRetry={refetch}
      >
        <div className="space-y-4">
          {docs.map((d) => (
            <div key={d.id} className="rounded-2xl border bg-white p-6">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h3 className="font-bold">{d.title}</h3>
                  <p className="text-sm text-slate-500">{d.student_name} · {d.category}</p>
                </div>
                <Badge variant={d.status === 'verified' ? 'success' : d.status === 'rejected' ? 'danger' : 'warning'}>{d.status}</Badge>
              </div>
              {d.file_url && (
                <a href={`${API_BASE}${d.file_url}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
                  View file
                </a>
              )}
              {d.status === 'pending' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => verifyMutation.mutate({ id: d.id, approved: true })}>Verify</Button>
                  <Button size="sm" variant="outline" onClick={() => setRejectId(d.id)}>Reject</Button>
                </div>
              )}
              {rejectId === d.id && (
                <div className="mt-3 space-y-2">
                  <Label>Rejection reason</Label>
                  <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => verifyMutation.mutate({ id: d.id, approved: false, rejection_reason: rejectReason })}>
                    Confirm Reject
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
