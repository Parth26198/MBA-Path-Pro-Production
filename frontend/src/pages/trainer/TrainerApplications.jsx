import { useQuery } from '@tanstack/react-query';

import { trainerApi } from '@/lib/api';

import { ApplicationCard } from '@/components/shared/ApplicationCard';

import { TrainerApplicationPanel } from '@/components/trainer/TrainerApplicationPanel';

import { PageState } from '@/components/shared/PageState';



export default function TrainerApplications() {

  const { data, isLoading, isError, error, refetch } = useQuery({

    queryKey: ['trainer-applications'],

    queryFn: trainerApi.applications,

  });

  const apps = data?.data || [];



  return (

    <div className="space-y-6">

      <div>

        <h2 className="font-display text-2xl font-bold">Applications</h2>

        <p className="text-sm text-slate-500">

          Manage applications for your assigned students only. Students can view updates but cannot edit.

        </p>

      </div>



      <PageState

        isLoading={isLoading}

        isError={isError}

        error={error}

        isEmpty={!isLoading && apps.length === 0}

        emptyTitle="No applications"

        emptyMessage="Applications from your assigned students will appear here."

        onRetry={refetch}

      >

        <div className="grid gap-6 xl:grid-cols-2">

          {apps.map((app) => (

            <div key={app.id} className="space-y-3">

              <ApplicationCard application={app} readOnly={false} timelineLimit={5} />

              <TrainerApplicationPanel application={app} />

            </div>

          ))}

        </div>

      </PageState>

    </div>

  );

}


