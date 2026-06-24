import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List, Search } from 'lucide-react';
import { studentApi } from '@/lib/api';
import { PageState } from '@/components/shared/PageState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UniversityCard } from '@/components/student/dashboard/UniversityCard';
import { MatchScoreBadge } from '@/components/student/shared/MatchScoreBadge';
import { SaveUniversityButton } from '@/components/student/universities/SaveUniversityButton';
import { useCompareStore } from '@/store/compareStore';
import { formatFees } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function StudentUniversities() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState('card');
  const [ranking, setRanking] = useState('all');
  const { toggle, isComparing } = useCompareStore();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-universities', search],
    queryFn: () => studentApi.universities({ search: search || undefined }),
  });

  let universities = data?.data || [];
  if (ranking === 'top10') universities = universities.filter((u) => u.ranking <= 10);
  if (ranking === 'top50') universities = universities.filter((u) => u.ranking <= 50);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-28">
      <div>
        <h1 className="font-display text-3xl font-bold">Universities</h1>
        <p className="mt-1 text-slate-600">Discover MBA programs that match your ambitions</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="student-card w-full shrink-0 p-5 lg:w-64">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filters</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Ranking</p>
              {[
                ['all', 'All'],
                ['top10', 'Top 10'],
                ['top50', 'Top 50'],
              ].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 py-1 text-sm">
                  <input type="radio" name="ranking" checked={ranking === val} onChange={() => setRanking(val)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Search universities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 rounded-xl border p-1">
              <Button variant={view === 'card' ? 'default' : 'ghost'} size="sm" onClick={() => setView('card')}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
            {view === 'card' ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {universities.filter(Boolean).map((u) => (
                  <UniversityCard key={u.id ?? u.slug} university={u} className="min-w-0 max-w-none" showActions />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {universities.map((u) => (
                  <div key={u.id} className={cn('student-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between')}>
                    <div>
                      <Link to={`/student/universities/${u.slug}`} className="font-semibold hover:text-brand-700">
                        {u.name}
                      </Link>
                      <p className="text-sm text-slate-500">{u.location} · Rank #{u.ranking}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <MatchScoreBadge score={u.match_score} />
                      <span className="text-sm text-slate-600">
                        {u.fees_min != null ? formatFees(u.fees_min) : ''}
                      </span>
                      <SaveUniversityButton university={u} />
                      <Button type="button" variant="outline" size="sm" onClick={() => toggle(u)}>
                        {isComparing(u.id) ? 'Comparing' : 'Compare'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PageState>
        </div>
      </div>
    </div>
  );
}
