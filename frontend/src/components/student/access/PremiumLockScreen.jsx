import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function PremiumLockScreen({
  title = 'Premium Feature',
  description = 'Upgrade your plan to unlock this feature and start your MBA application journey.',
  feature,
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-accent-100 bg-gradient-to-br from-accent-50 via-white to-brand-50 p-8 md:p-12">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-500/10 blur-2xl" />
      <div className="relative mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-premium">
          <Lock className="h-7 w-7" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">{feature || 'Premium'}</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-3 text-sm text-slate-600">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="premium" asChild>
            <Link to="/student/packages">View Packages</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/student/universities">Explore Universities</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PaidFeatureGate({ isPremium, children, feature, title, description }) {
  if (isPremium) return children;
  return <PremiumLockScreen feature={feature} title={title} description={description} />;
}
