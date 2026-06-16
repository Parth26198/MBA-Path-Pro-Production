import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { PageState } from '@/components/shared/PageState';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export default function AdminDocuments() {
  const [filter, setFilter] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-documents', filter],
    queryFn: () => adminApi.documents(filter ? { status: filter } : {}),
  });

  const docs = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">All Documents</h2>
        <select className="h-9 rounded-lg border border-slate-200 px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <PageState isLoading={isLoading} isError={isError} error={error} isEmpty={!isLoading && docs.length === 0} emptyTitle="No documents" onRetry={refetch}>
        <div className="grid gap-4 md:grid-cols-2">
          {docs.map((d) => (
            <div key={d.id} className="rounded-2xl border bg-white p-5">
              <h3 className="font-medium">{d.title}</h3>
              <p className="text-xs text-slate-500">{d.student_name} · {d.category}</p>
              <Badge className="mt-2" variant={d.status === 'verified' ? 'success' : d.status === 'rejected' ? 'danger' : 'warning'}>{d.status}</Badge>
              {d.file_url && (
                <a href={`${API_BASE}${d.file_url}`} target="_blank" rel="noreferrer" className="mt-2 block text-sm text-brand-600 hover:underline">View file</a>
              )}
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
