import { PremiumCollegeCard } from '@/components/colleges/PremiumCollegeCard';

/** @deprecated Use PremiumCollegeCard directly */
export function FeaturedSchoolCard({ school, college, ...props }) {
  return <PremiumCollegeCard college={college ?? school} {...props} />;
}
