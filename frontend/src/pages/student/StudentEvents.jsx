import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/lib/api';
import { PageState } from '@/components/shared/PageState';
import { EventsPreview } from '@/components/student/dashboard/EventsPreview';

export default function StudentEvents() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: studentApi.dashboard,
  });

  const sessions = data?.data?.sessions || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Events</h1>
        <p className="mt-1 text-slate-600">Webinars, workshops, and counselling sessions</p>
      </div>
      <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <EventsPreview sessions={sessions} />
      </PageState>
    </div>
  );
}
