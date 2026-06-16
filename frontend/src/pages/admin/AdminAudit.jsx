import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { PageState } from '@/components/shared/PageState';

export default function AdminAudit() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => adminApi.auditLogs({ limit: 100 }),
  });

  const logs = data?.data?.logs || data?.data || [];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Audit Logs</h2>
      <PageState isLoading={isLoading} isError={isError} error={error} isEmpty={!isLoading && logs.length === 0} emptyTitle="No audit logs" onRetry={refetch}>
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Entity</th>
                <th className="px-4 py-3 text-left">Details</th>
                <th className="px-4 py-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="px-4 py-3">{l.user_name || l.user_id}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                  <td className="px-4 py-3">{l.entity_type} #{l.entity_id}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{l.details}</td>
                  <td className="px-4 py-3">{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageState>
    </div>
  );
}
