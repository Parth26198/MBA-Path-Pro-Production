import { useQuery } from '@tanstack/react-query';
import { Users, GraduationCap, FileText, IndianRupee } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { adminApi } from '@/lib/api';
import { StatCard } from '@/components/shared/StatCard';
import { PageState } from '@/components/shared/PageState';
import { formatCurrency } from '@/lib/utils';

function computeGrowthTrend(studentGrowth = []) {
  if (studentGrowth.length < 2) return null;
  const prev = Number(studentGrowth[studentGrowth.length - 2]?.count || 0);
  const curr = Number(studentGrowth[studentGrowth.length - 1]?.count || 0);
  if (prev === 0) return curr > 0 ? 'New enrollments this month' : null;
  const pct = Math.round(((curr - prev) / prev) * 100);
  if (pct === 0) return 'Flat vs last month';
  return `${pct > 0 ? '+' : ''}${pct}% vs last month`;
}

export default function AdminDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.dashboard,
  });
  const d = data?.data || {};
  const totals = d.totals || {};
  const growthTrend = computeGrowthTrend(d.studentGrowth);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-slate-500">Complete business overview</p>
      </div>

      <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={totals.students ?? 0}
            icon={Users}
            trend={growthTrend}
            subtitle={`${totals.pendingApplications ?? 0} pending applications`}
          />
          <StatCard title="Trainers" value={totals.trainers ?? 0} icon={GraduationCap} />
          <StatCard
            title="Applications"
            value={totals.applications ?? 0}
            icon={FileText}
            subtitle={`${totals.activeApplications ?? 0} active`}
          />
          <StatCard title="Revenue" value={formatCurrency(totals.revenue ?? 0)} icon={IndianRupee} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-semibold">Student Growth</h3>
            {(d.studentGrowth || []).length > 0 ? (
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={d.studentGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3366ff" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No enrollment history yet.</p>
            )}
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-semibold">Package Analytics</h3>
            {(d.packageAnalytics || []).length > 0 ? (
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.packageAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="code" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="student_count" fill="#3366ff" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No package data yet.</p>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-semibold">Recent Students</h3>
            {(d.recentStudents || []).length > 0 ? (
              <ul className="mt-4 space-y-3">
                {d.recentStudents.map((s) => (
                  <li key={s.id} className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-slate-500">{s.package_name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No recent enrollments.</p>
            )}
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-semibold">Recent Activity</h3>
            {(d.recentActivities || []).length > 0 ? (
              <ul className="mt-4 space-y-3">
                {d.recentActivities.slice(0, 6).map((a) => (
                  <li key={a.id} className="border-l-2 border-brand-400 pl-3 text-sm">
                    <p className="font-medium">{a.description}</p>
                    <p className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No recent activity.</p>
            )}
          </div>
        </div>
      </PageState>
    </div>
  );
}
