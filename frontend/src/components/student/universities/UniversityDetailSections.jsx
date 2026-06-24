import { Link } from 'react-router-dom';
import { Building2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchScoreBadge } from '@/components/student/shared/MatchScoreBadge';
import { SaveUniversityButton } from '@/components/student/universities/SaveUniversityButton';
import { useCompareStore } from '@/store/compareStore';
import { useStudentTier } from '@/hooks/useStudentTier';
import { PaidFeatureGate } from '@/components/student/access/PremiumLockScreen';
import { formatFees, formatLPA } from '@/lib/utils';

export function UniversityDetailHero({ university, onApply }) {
  const { isPremium } = useStudentTier();
  const { toggle, isComparing } = useCompareStore();
  const cover = university.cover_banner_url || university.logo_url;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-hero-gradient text-white shadow-premium">
      <div className="absolute inset-0">
        {cover && <img src={cover} alt="" className="h-full w-full object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-700/80 to-accent-700/70" />
      </div>
      <div className="relative p-8 md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">University</p>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{university.name}</h1>
            <p className="mt-2 flex items-center gap-2 text-indigo-100">
              <MapPin className="h-4 w-4" />
              {university.location || `${university.city}, ${university.state}`}
              {university.ranking ? ` · Rank #${university.ranking}` : ''}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <MatchScoreBadge score={university.match?.score || university.match_score} className="bg-white/20 text-white" />
            <div className="flex flex-wrap gap-2">
              <SaveUniversityButton university={university} variant="secondary" />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => toggle(university)}
              >
                {isComparing(university.id) ? 'In Compare' : 'Compare'}
              </Button>
              <PaidFeatureGate isPremium={isPremium} feature="Apply" title="Premium Required" description="Upgrade to apply to this university.">
                <Button variant="accent" size="sm" onClick={onApply}>
                  Apply Now
                </Button>
              </PaidFeatureGate>
            </div>
          </div>
        </div>
        {university.fees_min && (
          <p className="mt-4 text-sm text-indigo-100">
            Tuition from {formatFees(university.fees_min)}
            {university.avg_package != null
              ? ` · Avg placement ${formatLPA(university.avg_package)}`
              : ''}
          </p>
        )}
      </div>
    </div>
  );
}

export function SimilarUniversities({ universities }) {
  if (!universities?.length) return null;
  return (
    <div className="student-card p-6">
      <h3 className="font-display text-lg font-bold">Similar Universities</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {universities.map((u) => (
          <Link key={u.id} to={`/student/universities/${u.slug}`} className="student-card-interactive rounded-xl border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="mt-3 font-semibold line-clamp-2">{u.name}</p>
            <MatchScoreBadge score={u.match_score} className="mt-2" />
          </Link>
        ))}
      </div>
    </div>
  );
}
