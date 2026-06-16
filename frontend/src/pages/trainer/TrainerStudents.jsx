import { useQuery } from '@tanstack/react-query';
import { trainerApi } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { PageState } from '@/components/shared/PageState';

export default function TrainerStudents() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['trainer-students'],
    queryFn: trainerApi.students,
  });
  const students = data?.data || [];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Assigned Students</h2>
      <PageState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && students.length === 0}
        emptyTitle="No assigned students"
        emptyMessage="Students will appear here once admin assigns them to you."
        onRetry={refetch}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {students.map((s) => {
            const used = ((s.colleges_applied || 0) / (s.college_limit || 1)) * 100;
            return (
              <div key={s.id} className="rounded-2xl border bg-white p-6">
                <h3 className="font-bold">{s.name}</h3>
                <p className="text-sm text-slate-500">
                  {s.email} · {s.phone}
                </p>
                <p className="mt-2 text-sm">Package: {s.package_name}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>College slots</span>
                    <span>
                      {s.colleges_applied}/{s.college_limit}
                    </span>
                  </div>
                  <Progress value={used} className="mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      </PageState>
    </div>
  );
}
