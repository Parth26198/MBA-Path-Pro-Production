import { Link } from 'react-router-dom';
import { HorizontalCarousel } from '@/components/student/shared/HorizontalCarousel';
import { MatchScoreBadge } from '@/components/student/shared/MatchScoreBadge';
import { Button } from '@/components/ui/button';

export function RecommendedProgramsPreview({ programs, title = 'Recommended Programs' }) {
  const items = programs || [];
  if (!items.length) return null;

  return (
    <HorizontalCarousel
      title={title}
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/student/programs">See all</Link>
        </Button>
      }
    >
      {items.map((p) => (
        <Link
          key={p.id}
          to={`/student/universities/${p.slug}`}
          className="student-card student-card-interactive block min-w-[280px] max-w-[300px] shrink-0 p-5"
        >
          <p className="text-xs font-semibold uppercase text-brand-600">{p.university_name}</p>
          <h4 className="mt-1 font-display font-bold">{p.program_name}</h4>
          <p className="mt-2 text-xs text-slate-500">{p.location}</p>
          <MatchScoreBadge score={p.match_score} className="mt-3" />
        </Link>
      ))}
    </HorizontalCarousel>
  );
}
