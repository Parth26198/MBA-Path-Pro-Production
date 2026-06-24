import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { studentApi, paymentApi, authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { PageState } from '@/components/shared/PageState';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/student/packages/CheckoutModal';
import { formatPackage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useStudentTier } from '@/hooks/useStudentTier';

export default function StudentPackages() {
  const qc = useQueryClient();
  const { isPremium } = useStudentTier();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const [selectedPkg, setSelectedPkg] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-packages-list'],
    queryFn: studentApi.packages,
  });

  const { data: subRes } = useQuery({
    queryKey: ['student-subscription'],
    queryFn: studentApi.subscription,
    enabled: isPremium,
  });

  const packages = data?.data || [];
  const subscription = subRes?.data?.subscription;

  const handlePaymentSuccess = async () => {
    setSelectedPkg(null);
    qc.invalidateQueries({ queryKey: ['student-dashboard'] });
    qc.invalidateQueries({ queryKey: ['student-subscription'] });
    const me = await authApi.me();
    setAuth({ token, user: me.data, profile: me.data.profile });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Packages</h1>
        <p className="mt-1 text-slate-600">Choose the plan that fits your MBA ambitions</p>
      </div>

      {isPremium && subscription && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="student-card border-brand-200 bg-brand-50 p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-lg font-bold">Current Plan: {subscription.package_name}</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {subscription.colleges_used}/{subscription.college_limit} applications used ·{' '}
            {subscription.colleges_remaining} remaining
          </p>
        </motion.div>
      )}

      <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg, i) => {
            const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features || [];
            const popular = pkg.code === 'B' || pkg.is_featured;
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'student-card student-card-interactive flex flex-col p-6',
                  popular && 'ring-2 ring-brand-400 shadow-premium'
                )}
              >
                {popular && (
                  <span className="mb-2 w-fit rounded-full bg-gradient-to-r from-accent-500 to-brand-500 px-3 py-1 text-xs font-bold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-xl font-bold">{pkg.name}</h3>
                <p className="mt-2 text-3xl font-bold">{formatPackage(pkg.price)}</p>
                <p className="text-sm text-slate-500">{pkg.college_limit} college applications</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={popular ? 'premium' : 'default'} className="mt-6 w-full" onClick={() => setSelectedPkg(pkg)}>
                  Buy Now
                </Button>
              </motion.div>
            );
          })}
        </div>

        <div className="student-card mt-8 overflow-x-auto p-6">
          <h2 className="font-display text-lg font-bold">Feature Comparison</h2>
          <table className="mt-4 w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">Feature</th>
                {packages.map((p) => (
                  <th key={p.id} className="py-2">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">College applications</td>
                {packages.map((p) => (
                  <td key={p.id}>{p.college_limit}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3">Mentor access</td>
                {packages.map((p) => (
                  <td key={p.id}>{p.code === 'A' ? '—' : '✓'}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3">Priority support</td>
                {packages.map((p) => (
                  <td key={p.id}>{p.code === 'C' ? '✓' : '—'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </PageState>

      <CheckoutModal
        open={!!selectedPkg}
        onOpenChange={(o) => !o && setSelectedPkg(null)}
        package={selectedPkg}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
