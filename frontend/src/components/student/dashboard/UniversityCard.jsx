import { PremiumCollegeCard } from '@/components/colleges/PremiumCollegeCard';

export function UniversityCard({ university, className, showActions = true, showMatchScore = false }) {
  if (!university) return null;

  return (
    <PremiumCollegeCard
      college={university}
      className={className || 'min-w-[340px] max-w-[340px] shrink-0'}
      showMatchScore={showMatchScore}
      studentMode={showActions}
    />
  );
}
