import { useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { studentApi } from '@/lib/api';
import { PageState } from '@/components/shared/PageState';
import { useStudentTier } from '@/hooks/useStudentTier';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function StudentResources() {
  const { isPremium } = useStudentTier();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: studentApi.dashboard,
  });

  const resources = data?.data?.resources || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Resources</h1>
        <p className="mt-1 text-slate-600">Guides, templates, and preparation materials</p>
      </div>
      <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <div className="grid gap-4 sm:grid-cols-2">
          {resources.map((r) => {
            const locked = r.is_premium && !isPremium;
            return (
              <div key={r.id} className={`student-card p-5 ${locked ? 'opacity-80' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-brand-600">{r.type}</p>
                    <h3 className="font-semibold">{r.title}</h3>
                  </div>
                  {locked && <Lock className="h-4 w-4 text-slate-400" />}
                </div>
                {locked ? (
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link to="/student/packages">Unlock with Premium</Link>
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="mt-4" asChild>
                    <Link to="/student/preparation">Open</Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </PageState>
    </div>
  );
}
