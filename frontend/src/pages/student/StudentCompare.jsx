import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/lib/api';
import { PageState } from '@/components/shared/PageState';
import { MatchScoreBadge } from '@/components/student/shared/MatchScoreBadge';
import { formatFees, formatHighestPackage, formatLPA } from '@/lib/utils';
import { Trophy } from 'lucide-react';

const ROWS = [
  { key: 'ranking', label: 'Ranking', render: (u) => `#${u.ranking}` },
  { key: 'fees_min', label: 'Fees (min)', render: (u) => formatFees(u.fees_min) },
  { key: 'location', label: 'Location', render: (u) => u.location || u.city },
  { key: 'accepted_exams', label: 'Exams', render: (u) => (u.accepted_exams || []).join(', ') || '—' },
  { key: 'program_count', label: 'Programs', render: (u) => u.program_count },
  { key: 'match_score', label: 'Match Score', render: (u) => `${u.match_score}%` },
  { key: 'eligibility', label: 'Eligibility', render: (u) => (u.eligibility || '—').slice(0, 80) },
];

const WINNER_LABELS = {
  ranking: 'Best Ranking',
  match_score: 'Best Match',
  roi: 'Best ROI',
  placement: 'Best Placement',
};

export default function StudentCompare() {
  const [params] = useSearchParams();
  const ids = params.get('ids') || '';

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['compare-universities', ids],
    queryFn: () => studentApi.compareUniversities(ids),
    enabled: !!ids,
  });

  const universities = data?.data?.universities || [];
  const winners = data?.data?.winners || {};

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      <div>
        <h1 className="font-display text-3xl font-bold">Compare Universities</h1>
        <p className="mt-1 text-slate-600">Side-by-side comparison of up to 3 universities</p>
      </div>

      <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {Object.keys(winners).length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(winners).map(([key, collegeId]) => {
              const uni = universities.find((u) => u.id === collegeId);
              if (!uni) return null;
              return (
                <div key={key} className="student-card flex items-center gap-3 p-4">
                  <Trophy className="h-5 w-5 text-warning-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">{WINNER_LABELS[key]}</p>
                    <p className="font-semibold">{uni.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="student-card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4">Category</th>
                {universities.map((u) => (
                  <th key={u.id} className="p-4">
                    <Link to={`/student/universities/${u.slug}`} className="font-display font-bold text-brand-700 hover:underline">
                      {u.name}
                    </Link>
                    <MatchScoreBadge score={u.match_score} className="mt-2" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key} className="border-b">
                  <td className="p-4 font-medium text-slate-600">{row.label}</td>
                  {universities.map((u) => (
                    <td
                      key={u.id}
                      className={`p-4 ${winners[row.key] === u.id || (row.key === 'match_score' && winners.match_score === u.id) ? 'bg-brand-50 font-semibold' : ''}`}
                    >
                      {row.render(u)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4 font-medium text-slate-600">Avg Placement</td>
                {universities.map((u) => (
                  <td
                    key={u.id}
                    className={`p-4 ${winners.placement === u.id ? 'bg-brand-50 font-semibold' : ''}`}
                  >
                    {u.avg_package != null ? formatLPA(u.avg_package) : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-600">Highest Placement</td>
                {universities.map((u) => (
                  <td key={u.id} className="p-4">
                    {u.highest_package != null ? formatHighestPackage(u.highest_package) : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </PageState>
    </div>
  );
}
