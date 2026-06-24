import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { studentApi } from '@/lib/api';
import { PageState } from '@/components/shared/PageState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MatchScoreBadge } from '@/components/student/shared/MatchScoreBadge';
import { PaidFeatureGate } from '@/components/student/access/PremiumLockScreen';
import { RecommendedProgramsPreview } from '@/components/student/dashboard/RecommendedProgramsPreview';
import { useStudentTier } from '@/hooks/useStudentTier';
import { formatFees } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function StudentPrograms() {
  const { isPremium } = useStudentTier();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-programs', search],
    queryFn: () => studentApi.programs({ search: search || undefined }),
  });

  const { data: recData } = useQuery({
    queryKey: ['recommended-programs'],
    queryFn: studentApi.recommendedPrograms,
  });

  const programs = data?.data || [];
  const recommended = recData?.data || [];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Programs</h1>
        <p className="mt-1 text-slate-600">Explore MBA specializations across top universities</p>
      </div>

      {recommended.length > 0 && <RecommendedProgramsPreview programs={recommended} title="Recommended for You" />}

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input className="pl-10" placeholder="Search programs..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <div className="space-y-4">
          {programs.map((p) => (
            <div key={p.id} className="student-card student-card-interactive p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{p.university_name}</p>
                  <h3 className="font-display text-xl font-bold">{p.program_name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {p.duration} · {p.format} · {p.country}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {p.fees_min != null ? `Tuition from ${formatFees(p.fees_min)}` : ''}
                    {p.ranking ? ` · Rank #${p.ranking}` : ''}
                  </p>
                  {p.eligibility && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{p.eligibility}</p>}
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <MatchScoreBadge score={p.match_score} />
                  <PaidFeatureGate
                    isPremium={isPremium}
                    feature="Applications"
                    title="Apply with Premium"
                    description="Upgrade to submit applications to this program."
                  >
                    <Button size="sm" asChild>
                      <Link to="/student/applications">Apply Now</Link>
                    </Button>
                  </PaidFeatureGate>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
