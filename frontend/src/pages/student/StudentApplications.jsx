import { useQuery } from '@tanstack/react-query';

import { studentApi } from '@/lib/api';

import { ApplicationCard } from '@/components/shared/ApplicationCard';

import { PageState } from '@/components/shared/PageState';



export default function StudentApplications() {

  const { data, isLoading, isError, error, refetch } = useQuery({

    queryKey: ['student-applications'],

    queryFn: studentApi.applications,

  });



  const apps = data?.data || [];



  return (

    <div className="space-y-6">

      <div>

        <h2 className="font-display text-2xl font-bold">Application Tracking</h2>

        <p className="text-sm text-slate-500">

          You can view progress only. Your trainer updates all checklist items.

        </p>

      </div>

      <PageState

        isLoading={isLoading}

        isError={isError}

        error={error}

        isEmpty={!isLoading && apps.length === 0}

        emptyTitle="No applications yet"

        emptyMessage="Apply to colleges from your dashboard to start tracking."

        onRetry={refetch}

      >

        <div className="grid gap-6 lg:grid-cols-2">

          {apps.map((app) => (

            <ApplicationCard key={app.id} application={app} readOnly timelineLimit={10} />

          ))}

        </div>

      </PageState>

    </div>

  );

}


