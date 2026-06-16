import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { PageState } from '@/components/shared/PageState';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAnalytics() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.dashboard,
  });
  const d = data?.data || {};

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Analytics</h2>
      <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <div className="rounded-2xl border bg-white p-6">
          <h3 className="font-semibold">College Application Analytics</h3>
          {(d.collegeAnalytics || []).length > 0 ? (
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.collegeAnalytics} layout="vertical">
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#3366ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No college application data yet.</p>
          )}
        </div>
        <div className="mt-6 rounded-2xl border bg-white p-6">
          <h3 className="font-semibold">Trainer Performance</h3>
          {(d.trainerPerformance || []).length > 0 ? (
            <ul className="mt-4 space-y-2">
              {d.trainerPerformance.map((t) => (
                <li key={t.trainer_name} className="flex justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm">
                  <span>{t.trainer_name}</span>
                  <span>
                    {t.students} students · {t.applications} apps
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No trainer performance data yet.</p>
          )}
        </div>
      </PageState>
    </div>
  );
}
