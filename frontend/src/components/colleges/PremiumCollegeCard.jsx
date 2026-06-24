import { Link } from 'react-router-dom';
import { Bookmark, GitCompare, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SaveUniversityButton } from '@/components/student/universities/SaveUniversityButton';
import { useCompareStore } from '@/store/compareStore';
import { FALLBACK_CAMPUS_IMAGE, normalizeCollegeCard } from '@/constants/collegeCardMeta';
import { formatFees, formatHighestPackage, formatLPA } from '@/lib/utils';
import '@/styles/college-card.css';

export function PremiumCollegeCard({
  college,
  index = 0,
  showMatchScore = false,
  fluid = false,
  studentMode = false,
  detailHref,
  className = '',
}) {
  if (!college) return null;

  const data = normalizeCollegeCard(college);
  const { toggle, isComparing } = useCompareStore();
  const href =
    detailHref ||
    (studentMode && data.slug ? `/student/universities/${data.slug}` : '/colleges');
  const comparing = studentMode && college?.id != null && isComparing(college.id);
  const recruiters = data.recruiters?.length ? data.recruiters : [];
  const exams = data.exams?.length ? data.exams : ['CAT'];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className={`premium-college-card ${fluid ? 'premium-college-card--fluid' : ''} ${className}`}
    >
      <div className="premium-college-card__media">
        <img
          src={data.image || FALLBACK_CAMPUS_IMAGE}
          alt={`${data.name || 'MBA'} campus`}
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_CAMPUS_IMAGE) {
              e.currentTarget.src = FALLBACK_CAMPUS_IMAGE;
            }
          }}
        />
        <div className="premium-college-card__overlay" aria-hidden />
        <span className="premium-college-card__logo">{data.logo}</span>
        <div className="premium-college-card__badges">
          {data.imageBadges?.map((badge, i) => (
            <span
              key={badge}
              className={`premium-college-card__badge ${i === 0 ? 'premium-college-card__badge--rank' : ''}`}
            >
              {badge}
            </span>
          ))}
        </div>
        {showMatchScore && data.matchScore != null && (
          <span className="premium-college-card__match">{data.matchScore}% Match</span>
        )}
      </div>

      <div className="premium-college-card__body">
        <h3 className="premium-college-card__title">{data.name}</h3>
        <p className="premium-college-card__location">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {data.location}
        </p>

        <dl className="premium-college-card__placement">
          <div>
            <dt>Average Package</dt>
            <dd className="highlight">{formatLPA(data.avgPackage)}</dd>
          </div>
          <div>
            <dt>Highest Package</dt>
            <dd>{formatHighestPackage(data.highestPackage)}</dd>
          </div>
        </dl>

        {data.fees != null && (
          <p className="premium-college-card__fees">
            Program Fees: <strong>{formatFees(data.fees)}</strong>
          </p>
        )}

        <div className="premium-college-card__recruiters">
          <p className="premium-college-card__recruiters-label">Top Recruiters</p>
          <div className="premium-college-card__recruiter-list">
            {recruiters.map((r) => (
              <span key={r} className="premium-college-card__recruiter">
                {r}
              </span>
            ))}
          </div>
        </div>

        <p className="premium-college-card__exams">
          Exams: <strong>{exams.slice(0, 3).join(', ')}</strong>
        </p>

        <div className="premium-college-card__actions">
          {studentMode ? (
            <>
              <SaveUniversityButton university={college} className="flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={() => toggle(college)}>
                <GitCompare className="mr-1 h-3.5 w-3.5" />
                {comparing ? 'Added' : 'Compare'}
              </Button>
              <Button size="sm" className="bg-[#0F172A] hover:bg-[#1E293B]" asChild>
                <Link to={href}>View Details</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="rounded-lg" asChild>
                <Link to="/register">
                  <Bookmark className="mr-1 h-3.5 w-3.5" /> Save
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg" asChild>
                <Link to="/register">
                  <GitCompare className="mr-1 h-3.5 w-3.5" /> Compare
                </Link>
              </Button>
              <Button size="sm" className="flex-1 rounded-lg bg-[#0F172A] hover:bg-[#1E293B]" asChild>
                <Link to={href}>View Details</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}
