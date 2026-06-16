import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function CollegesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['colleges'], queryFn: () => publicApi.colleges() });
  const colleges = data?.data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h1 className="font-display text-4xl font-bold">MBA Colleges</h1>
      <p className="mt-2 text-slate-600">Explore partner B-schools and program details</p>
      {isLoading ? (
        <p className="mt-8">Loading...</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {colleges.map((c) => (
            <article key={c.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
              <div className="h-32 bg-gradient-to-br from-brand-600 to-brand-400" />
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <h2 className="font-display text-lg font-bold">{c.name}</h2>
                  {c.is_featured ? <Badge variant="success">Featured</Badge> : null}
                </div>
                <p className="text-sm text-slate-500">{c.location}</p>
                <p className="mt-3 text-sm line-clamp-3">{c.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-slate-500">Ranking</dt><dd className="font-semibold">#{c.ranking}</dd></div>
                  <div><dt className="text-slate-500">Fees</dt><dd className="font-semibold">{formatCurrency(c.fees_min)}+</dd></div>
                  <div><dt className="text-slate-500">Avg Package</dt><dd className="font-semibold">{formatCurrency(c.avg_package)}</dd></div>
                  <div><dt className="text-slate-500">Exams</dt><dd className="font-semibold">{(c.accepted_exams || []).join(', ')}</dd></div>
                </dl>
                {c.specializations?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {c.specializations.slice(0, 3).map((s) => (
                      <Badge key={s} variant="muted">{s}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
