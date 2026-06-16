import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { PageState } from '@/components/shared/PageState';
import { formatPackage } from '@/lib/utils';

export default function AdminPayments() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminApi.payments({ limit: 50 }),
  });

  const payments = data?.data?.payments || [];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Payments</h2>
      <PageState isLoading={isLoading} isError={isError} error={error} isEmpty={!isLoading && payments.length === 0} emptyTitle="No payments" onRetry={refetch}>
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Package</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="px-4 py-3">{p.student_name}</td>
                  <td className="px-4 py-3">{p.package_name}</td>
                  <td className="px-4 py-3">{formatPackage(p.amount)}</td>
                  <td className="px-4 py-3"><Badge variant={p.status === 'completed' ? 'success' : 'warning'}>{p.status}</Badge></td>
                  <td className="px-4 py-3">{p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageState>
    </div>
  );
}
