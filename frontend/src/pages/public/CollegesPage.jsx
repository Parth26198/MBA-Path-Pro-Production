import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';
import { PremiumCollegeCard } from '@/components/colleges/PremiumCollegeCard';

export default function CollegesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['colleges'], queryFn: () => publicApi.colleges() });
  const colleges = data?.data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-[#0F172A]">MBA Colleges</h1>
      <p className="mt-2 text-slate-600">Explore partner B-schools with real campus profiles, placements, and recruiter data</p>
      {isLoading ? (
        <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[520px] animate-pulse rounded-[20px] bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {colleges.filter(Boolean).map((c, i) => (
            <PremiumCollegeCard key={c.id ?? i} college={c} index={i} fluid />
          ))}
        </div>
      )}
    </div>
  );
}
