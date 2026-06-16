import { useQuery } from '@tanstack/react-query';

import { studentApi } from '@/lib/api';

import { ApplicationCard } from '@/components/shared/ApplicationCard';

import { ApplyCollegeSection } from '@/components/student/ApplyCollegeSection';

import { PageState } from '@/components/shared/PageState';

import { Progress } from '@/components/ui/progress';

import { Badge } from '@/components/ui/badge';

import { User, Package, Bell } from 'lucide-react';



export default function StudentDashboard() {

  const { data, isLoading, isError, error, refetch } = useQuery({

    queryKey: ['student-dashboard'],

    queryFn: studentApi.dashboard,

  });

  const d = data?.data || {};

  const student = d.student || {};

  const usedPct = ((student.colleges_applied || 0) / (student.college_limit || 1)) * 100;



  return (

    <div className="space-y-8">

      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 p-6 text-white md:p-8">

        <h2 className="font-display text-2xl font-bold">

          Welcome, {student.name?.split(' ')[0] || 'Student'}!

        </h2>

        <p className="mt-1 text-blue-100">Track your MBA admission journey — view only mode</p>

      </div>



      <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>

        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-5">

            <div className="flex items-center gap-2 text-slate-500">

              <User className="h-4 w-4" /> Assigned Trainer

            </div>

            <p className="mt-2 font-bold">{student.trainer_name || 'Pending assignment'}</p>

            {student.trainer_email && <p className="text-sm text-slate-500">{student.trainer_email}</p>}

          </div>

          <div className="rounded-2xl border bg-white p-5">

            <div className="flex items-center gap-2 text-slate-500">

              <Package className="h-4 w-4" /> Package

            </div>

            <p className="mt-2 font-bold">

              {student.package_name} (Package {student.package_code})

            </p>

            <div className="mt-3">

              <div className="flex justify-between text-xs">

                <span>

                  Colleges: {student.colleges_applied}/{student.college_limit}

                </span>

                <span>{student.colleges_remaining} remaining</span>

              </div>

              <Progress value={usedPct} className="mt-1" />

            </div>

          </div>

          <div className="rounded-2xl border bg-white p-5">

            <div className="flex items-center gap-2 text-slate-500">

              <Bell className="h-4 w-4" /> Notifications

            </div>

            {(d.notifications || []).length > 0 ? (

              <ul className="mt-2 space-y-2">

                {d.notifications.slice(0, 2).map((n) => (

                  <li key={n.id} className="text-sm">

                    <Badge variant={n.type === 'warning' ? 'warning' : 'muted'} className="mr-1">

                      {n.type}

                    </Badge>

                    {n.title}

                  </li>

                ))}

              </ul>

            ) : (

              <p className="mt-2 text-sm text-slate-500">No notifications yet.</p>

            )}

          </div>

        </div>



        <div className="mt-8">

          <ApplyCollegeSection student={student} />

        </div>



        <div className="mt-8">

          <h3 className="font-display text-xl font-bold">Your Applications</h3>

          {(d.applications || []).length > 0 ? (

            <div className="mt-4 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">

              {d.applications.map((app) => (

                <ApplicationCard key={app.id} application={app} readOnly timelineLimit={10} />

              ))}

            </div>

          ) : (

            <p className="mt-4 text-sm text-slate-500">Apply to a college above to get started.</p>

          )}

        </div>



        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <div className="rounded-2xl border bg-white p-6">

            <h3 className="font-semibold">Preparation Tasks</h3>

            {(d.preparationTasks || []).length > 0 ? (

              <ul className="mt-4 space-y-3">

                {d.preparationTasks.map((t) => (

                  <li key={t.id} className="rounded-xl bg-slate-50 p-3 text-sm">

                    <p className="font-medium">{t.title}</p>

                    <Badge className="mt-1" variant={t.status === 'verified' ? 'success' : 'warning'}>

                      {t.status}

                    </Badge>

                    {t.trainer_remarks && <p className="mt-2 text-slate-600">{t.trainer_remarks}</p>}

                  </li>

                ))}

              </ul>

            ) : (

              <p className="mt-4 text-sm text-slate-500">No preparation tasks assigned yet.</p>

            )}

          </div>

          <div className="rounded-2xl border bg-white p-6">

            <h3 className="font-semibold">Recent Sessions</h3>

            {(d.sessions || []).length > 0 ? (

              <ul className="mt-4 space-y-3">

                {d.sessions.map((s) => (

                  <li key={s.id} className="border-b pb-2 text-sm">

                    <p className="font-medium">{s.title || s.session_type}</p>

                    <p className="text-slate-500">

                      {new Date(s.scheduled_at).toLocaleDateString()} · {s.duration_minutes} min

                    </p>

                  </li>

                ))}

              </ul>

            ) : (

              <p className="mt-4 text-sm text-slate-500">No sessions scheduled yet.</p>

            )}

          </div>

        </div>

      </PageState>

    </div>

  );

}


