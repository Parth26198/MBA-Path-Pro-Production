import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/lib/api';
import { PageState } from '@/components/shared/PageState';
import { MentorPanel } from '@/components/student/dashboard/MentorPanel';
import { PremiumLockScreen } from '@/components/student/access/PremiumLockScreen';
import { useStudentTier } from '@/hooks/useStudentTier';

export default function StudentMentors() {
  const { isPremium } = useStudentTier();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: studentApi.dashboard,
  });

  const d = data?.data || {};

  if (!isPremium) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="font-display text-3xl font-bold">Mentors</h1>
        <PremiumLockScreen
          feature="Mentor Access"
          title="Premium Mentor Support"
          description="Get assigned a dedicated MBA counsellor, book sessions, and receive personalized feedback."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-3xl font-bold">Mentors</h1>
      <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <MentorPanel student={d.student} sessions={d.sessions} />
      </PageState>
    </div>
  );
}
