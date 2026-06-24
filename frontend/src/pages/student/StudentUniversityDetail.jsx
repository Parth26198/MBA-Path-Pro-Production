import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api';
import { PageState } from '@/components/shared/PageState';
import { MatchBreakdownCard } from '@/components/student/universities/MatchBreakdownCard';
import { UniversityDetailHero, SimilarUniversities } from '@/components/student/universities/UniversityDetailSections';
import { formatCrore, formatFees, formatHighestPackage, formatLPA } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function StudentUniversityDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['university-detail', slug],
    queryFn: () => studentApi.university(slug),
  });

  const applyMutation = useMutation({
    mutationFn: (collegeId) => studentApi.applyCollege(collegeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-applications'] });
      navigate('/student/applications');
    },
  });

  const university = data?.data;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-24">
      <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        {university && (
          <>
            <UniversityDetailHero
              university={university}
              onApply={() => applyMutation.mutate(university.id)}
            />

            <MatchBreakdownCard match={university.match} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="student-card p-6 lg:col-span-2">
                <h2 className="font-display text-lg font-bold">University Overview</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{university.description}</p>
              </div>
              <div className="student-card p-6">
                <h2 className="font-display text-lg font-bold">Quick Stats</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>Ranking: #{university.ranking}</li>
                  <li>
                    Fees: {formatFees(university.fees_min)}
                    {university.fees_max != null && university.fees_max !== university.fees_min
                      ? ` – ${formatFees(university.fees_max)}`
                      : ''}
                  </li>
                  {university.avg_package != null && (
                    <li>Avg Package: {formatLPA(university.avg_package)}</li>
                  )}
                  {university.highest_package != null && (
                    <li>Highest Package: {formatHighestPackage(university.highest_package)}</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="student-card p-6">
              <h2 className="font-display text-lg font-bold">Programs Offered</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {university.programs?.map((p) => (
                  <div key={p.name} className="rounded-xl border border-slate-100 p-4">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-brand-600">{p.match_score}% program match</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="student-card p-6">
                <h2 className="font-display text-lg font-bold">Admission Requirements</h2>
                <p className="mt-3 text-sm text-slate-600">{university.eligibility || 'See university website for details.'}</p>
                <p className="mt-4 text-sm font-medium">Exams Accepted</p>
                <p className="text-sm text-slate-600">{(university.accepted_exams || []).join(', ') || 'CAT, GMAT, XAT'}</p>
              </div>
              <div className="student-card p-6">
                <h2 className="font-display text-lg font-bold">Application Deadlines</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {(university.deadlines || []).length > 0 ? (
                    university.deadlines.map((d, i) => <li key={i}>{typeof d === 'string' ? d : JSON.stringify(d)}</li>)
                  ) : (
                    <li>Round-based deadlines — check official admissions page.</li>
                  )}
                </ul>
                {university.admission_process && (
                  <>
                    <p className="mt-4 text-sm font-medium">Process</p>
                    <p className="text-sm text-slate-600">{university.admission_process}</p>
                  </>
                )}
              </div>
            </div>

            {university.gallery?.length > 0 && (
              <div className="student-card p-6">
                <h2 className="font-display text-lg font-bold">Gallery</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {university.gallery.map((g) => (
                    <img key={g.id} src={g.image_url} alt={g.caption || ''} className="h-28 w-full rounded-xl object-cover" loading="lazy" />
                  ))}
                </div>
              </div>
            )}

            <SimilarUniversities universities={university.similar} />

            {university.website && (
              <p className="text-center text-sm">
                <a href={university.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                  Visit official website
                </a>
                {' · '}
                <Link to="/student/universities" className="text-brand-600 hover:underline">Back to explorer</Link>
              </p>
            )}
          </>
        )}
      </PageState>
    </div>
  );
}
