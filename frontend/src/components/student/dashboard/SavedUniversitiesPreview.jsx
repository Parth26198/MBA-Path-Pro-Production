import { Link } from 'react-router-dom';
import { HorizontalCarousel } from '@/components/student/shared/HorizontalCarousel';
import { UniversityCard } from '@/components/student/dashboard/UniversityCard';
import { Button } from '@/components/ui/button';

export function SavedUniversitiesPreview({ universities }) {
  const items = universities || [];

  if (items.length === 0) {
    return (
      <div className="student-card p-6">
        <h3 className="font-display text-lg font-bold">Saved Universities</h3>
        <p className="mt-2 text-sm text-slate-500">Save universities while exploring to build your shortlist.</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/student/universities">Explore Universities</Link>
        </Button>
      </div>
    );
  }

  return (
    <HorizontalCarousel
      title="Saved Universities"
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/student/universities">View all</Link>
        </Button>
      }
    >
      {items.filter(Boolean).map((u) => (
        <UniversityCard key={u.id ?? u.slug} university={u} />
      ))}
    </HorizontalCarousel>
  );
}
