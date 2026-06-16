import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { PageState } from '@/components/shared/PageState';

export default function AdminApplications() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: adminApi.applications,
  });
  const apps = data?.data || [];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">All Applications</h2>
      <PageState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && apps.length === 0}
        emptyTitle="No applications"
        emptyMessage="Applications will appear when students apply to colleges."
        onRetry={refetch}
      >
        <div className="space-y-4">
          {apps.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-4"
            >
              <div>
                <p className="font-semibold">{a.college_name}</p>
                <p className="text-sm text-slate-500">
                  {a.student_name} · Trainer: {a.trainer_name || '—'}
                </p>
              </div>
              <Badge>{a.status}</Badge>
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
