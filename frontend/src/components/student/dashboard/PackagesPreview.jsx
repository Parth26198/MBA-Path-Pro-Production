import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPackage } from '@/lib/utils';
import { useStudentTier } from '@/hooks/useStudentTier';

export function PackagesPreview({ packages, student }) {
  const { isPremium } = useStudentTier();
  const list = (packages || []).slice(0, 3);

  if (isPremium && student?.package_name) {
    return (
      <div className="student-card p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent-500" />
          <h3 className="font-display text-lg font-bold">Your Package</h3>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{student.package_name}</p>
        <p className="text-sm text-slate-500">
          {student.colleges_applied}/{student.colleges_allowed} applications used
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/student/packages">Manage Package</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="student-card p-6">
      <h3 className="font-display text-lg font-bold">Choose Your Plan</h3>
      <p className="mt-1 text-sm text-slate-500">Unlock applications and premium features</p>
      <div className="mt-4 space-y-3">
        {list.map((pkg) => {
          const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features || [];
          return (
            <div key={pkg.id} className="rounded-xl border border-slate-100 p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{pkg.name}</p>
                <p className="font-bold text-brand-700">{formatPackage(pkg.price)}</p>
              </div>
              <p className="text-xs text-slate-500">{pkg.college_limit} colleges</p>
              <ul className="mt-2 space-y-1">
                {features.slice(0, 2).map((f) => (
                  <li key={f} className="flex items-center gap-1 text-xs text-slate-600">
                    <Check className="h-3 w-3 text-success-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <Button variant="premium" className="mt-4 w-full" asChild>
        <Link to="/student/packages">View All Packages</Link>
      </Button>
    </div>
  );
}
