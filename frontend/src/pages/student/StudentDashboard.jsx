import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/lib/api';
import { PageState } from '@/components/shared/PageState';
import { UpgradeBanner } from '@/components/student/access/UpgradeBanner';
import { HeroBanner } from '@/components/student/dashboard/HeroBanner';
import { MbaJourneyProgress } from '@/components/student/dashboard/MbaJourneyProgress';
import { ProfileCompletionCard } from '@/components/student/dashboard/ProfileCompletionCard';
import { ApplicationTracker } from '@/components/student/dashboard/ApplicationTracker';
import { UniversityCard } from '@/components/student/dashboard/UniversityCard';
import { HorizontalCarousel } from '@/components/student/shared/HorizontalCarousel';
import { SavedUniversitiesPreview } from '@/components/student/dashboard/SavedUniversitiesPreview';
import { RecommendedProgramsPreview } from '@/components/student/dashboard/RecommendedProgramsPreview';
import { ApplicationTimelinePreview } from '@/components/student/applications/ApplicationTimeline';
import { EventsPreview } from '@/components/student/dashboard/EventsPreview';
import { ResourcesPreview } from '@/components/student/dashboard/ResourcesPreview';
import { MentorPanel } from '@/components/student/dashboard/MentorPanel';
import { UpcomingDeadlinesPreview } from '@/components/student/dashboard/UpcomingDeadlinesPreview';
import { PackagesPreview } from '@/components/student/dashboard/PackagesPreview';
import { useStudentTier } from '@/hooks/useStudentTier';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <div className="feed-layout">
      <CardSkeleton className="h-48" />
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton className="h-56" />
        <CardSkeleton className="h-56" />
      </div>
      <CardSkeleton className="h-64" />
    </div>
  );
}

export default function StudentDashboard() {
  const { isPremium } = useStudentTier();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: studentApi.dashboard,
  });

  const d = data?.data || {};
  const student = d.student || {};

  return (
    <div className="mx-auto max-w-6xl">
      {!isPremium && <UpgradeBanner />}

      <PageState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        loadingFallback={<DashboardSkeleton />}
      >
        <div className="feed-layout">
          <HeroBanner hero={d.hero} userName={user?.name} />

          <div className="grid gap-6 lg:grid-cols-2">
            <MbaJourneyProgress journey={d.journey} />
            <ProfileCompletionCard completion={student.profile_completion} />
          </div>

          <SavedUniversitiesPreview universities={d.savedUniversities} />

          <HorizontalCarousel
            title="Recommended for you"
            subtitle="Universities matched to your profile"
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/universities">See all</Link>
              </Button>
            }
          >
            {(d.recommendedColleges || []).filter(Boolean).map((u) => (
              <UniversityCard
                key={u.id ?? u.slug}
                university={u}
                showActions
                showMatchScore={profile?.onboarding_completed === true}
              />
            ))}
          </HorizontalCarousel>

          <RecommendedProgramsPreview programs={d.recommendedPrograms} />

          <div className="grid gap-6 lg:grid-cols-2">
            <ApplicationTracker stats={d.applicationStats} />
            <UpcomingDeadlinesPreview />
          </div>

          <ApplicationTimelinePreview events={d.admissionTimeline} />

          <div className="grid gap-6 lg:grid-cols-2">
            <EventsPreview sessions={d.sessions} />
            <ResourcesPreview resources={d.resources} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <MentorPanel student={student} sessions={d.sessions} />
            <PackagesPreview student={student} packages={d.packages} />
          </div>
        </div>
      </PageState>
    </div>
  );
}
