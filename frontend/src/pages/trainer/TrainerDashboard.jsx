import { useQuery } from '@tanstack/react-query';
import { trainerApi } from '@/lib/api';
import { StatCard } from '@/components/shared/StatCard';
import { PageState } from '@/components/shared/PageState';
import { useAuthStore } from '@/store/authStore';
import { Users, ClipboardList, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TrainerDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['trainer-dashboard'],
    queryFn: trainerApi.dashboard,
  });
  const d = data?.data || {};
  const firstName = user?.name?.split(' ')[0] || 'Trainer';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold">Trainer Dashboard</h2>
        <p className="text-slate-500">Welcome, {firstName} — manage your assigned students</p>
      </div>

      <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Assigned Students" value={d.stats?.assignedStudents ?? 0} icon={Users} />
          <StatCard title="Pending Work" value={d.stats?.pendingWork ?? 0} icon={ClipboardList} />
          <StatCard title="Upcoming Sessions" value={d.stats?.upcomingSessions ?? 0} icon={Calendar} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-semibold">Assigned Students</h3>
            {(d.students || []).length > 0 ? (
              <ul className="mt-4 space-y-3">
                {d.students.map((s) => (
                  <li key={s.id} className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.package_name}</p>
                    </div>
                    <Badge>{s.application_count} apps</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No students assigned yet.</p>
            )}
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-semibold">Upcoming Sessions</h3>
            {(d.upcomingSessions || []).length > 0 ? (
              <ul className="mt-4 space-y-3">
                {d.upcomingSessions.map((s) => (
                  <li key={s.id} className="rounded-xl border px-4 py-3 text-sm">
                    <p className="font-medium">{s.title || s.session_type}</p>
                    <p className="text-slate-500">
                      {s.student_name} · {new Date(s.scheduled_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No upcoming sessions scheduled.</p>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-6">
          <h3 className="font-semibold">Application Status Overview</h3>
          {(d.applicationStatuses || []).length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {d.applicationStatuses.map((s) => (
                <Badge key={s.status} variant="muted">
                  {s.status}: {s.count}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No application data yet.</p>
          )}
        </div>
      </PageState>
    </div>
  );
}
