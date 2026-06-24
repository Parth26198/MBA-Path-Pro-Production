import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/lib/api';
import { ApplicationCard } from '@/components/shared/ApplicationCard';
import { PageState } from '@/components/shared/PageState';
import { ApplyCollegeSection } from '@/components/student/ApplyCollegeSection';
import { ApplicationTracker } from '@/components/student/dashboard/ApplicationTracker';
import { ApplicationTimelinePreview } from '@/components/student/applications/ApplicationTimeline';
import { useStudentTier } from '@/hooks/useStudentTier';

export default function StudentApplications() {
  const { isPremium } = useStudentTier();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-applications'],
    queryFn: studentApi.applications,
  });

  const { data: dashRes } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: studentApi.dashboard,
  });

  const apps = data?.data || [];
  const student = dashRes?.data?.student || {};
  const stats = dashRes?.data?.applicationStats;
  const admissionTimeline = dashRes?.data?.admissionTimeline;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Applications</h1>
        <p className="mt-1 text-slate-600">Track your MBA application progress</p>
      </div>

      {isPremium && stats && <ApplicationTracker stats={stats} />}

      {admissionTimeline?.length > 0 && <ApplicationTimelinePreview events={admissionTimeline} />}

      <ApplyCollegeSection student={student} />

      <PageState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && apps.length === 0}
        emptyTitle="No applications yet"
        emptyMessage={isPremium ? 'Apply to a college above to get started.' : 'Upgrade to start applying to colleges.'}
        onRetry={refetch}
      >
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {apps.map((app) => (
            <ApplicationCard key={app.id} application={app} readOnly timelineLimit={10} />
          ))}
        </div>
      </PageState>
    </div>
  );
}
