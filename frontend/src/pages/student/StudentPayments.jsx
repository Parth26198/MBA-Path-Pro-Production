import { useQuery } from '@tanstack/react-query';
import { paymentApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { PageState } from '@/components/shared/PageState';
import { formatPackage } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export default function StudentPayments() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-payments'],
    queryFn: paymentApi.history,
  });

  const payments = data?.data || [];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Payment History</h2>
      <PageState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && payments.length === 0}
        emptyTitle="No payments"
        emptyMessage="Your package payments and invoices will appear here."
        onRetry={refetch}
      >
        <div className="space-y-4">
          {payments.map((p) => (
            <div key={p.id} className="rounded-2xl border bg-white p-6">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-bold">{p.package_name || 'Package Payment'}</p>
                  <p className="text-sm text-slate-500">{p.paid_at ? new Date(p.paid_at).toLocaleString() : 'Pending'}</p>
                </div>
                <Badge variant={p.status === 'completed' ? 'success' : p.status === 'failed' ? 'danger' : 'warning'}>
                  {p.status}
                </Badge>
              </div>
              <p className="mt-2 text-lg font-semibold">{formatPackage(p.amount)}</p>
              {p.invoice_number && <p className="text-xs text-slate-500">Invoice: {p.invoice_number}</p>}
              {p.invoice_url && (
                <a href={`${API_BASE}${p.invoice_url}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
                  Download Invoice
                </a>
              )}
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
