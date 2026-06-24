import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatPackage, cn } from '@/lib/utils';

export function PackageCards({ packages, onBuyNow, mode = 'dashboard', featured = true }) {  const isMarketing = mode === 'marketing';

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {packages?.map((pkg, i) => {
        const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features || [];
        const isPopular = pkg.code === 'B' || pkg.is_featured;

        return (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              'relative flex flex-col rounded-3xl border p-6 transition-all hover:-translate-y-1 hover:shadow-premium',
              isPopular && featured
                ? 'border-brand-400 bg-gradient-to-b from-brand-50 to-white shadow-premium ring-2 ring-brand-400'
                : 'bg-white'
            )}
          >
            {isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent-500 to-brand-500 px-4 py-1 text-xs font-bold text-white">
                <Sparkles className="mr-1 inline h-3 w-3" /> Most Popular
              </span>
            )}
            <p className="text-sm font-semibold text-brand-600">Package {pkg.code}</p>
            <h3 className="font-display text-2xl font-bold">{pkg.name}</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatPackage(pkg.price)}
              <span className="text-sm font-normal text-slate-500"> / program</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">{pkg.description}</p>
            <p className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-center text-sm font-semibold text-brand-800">
              Apply to {pkg.college_limit} colleges
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            {isMarketing ? (
              <Button className="mt-6 w-full" variant={isPopular ? 'premium' : 'secondary'} asChild>
                <Link to="/register">Sign Up Free</Link>
              </Button>
            ) : (
              <Button
                className="mt-6 w-full"
                variant={isPopular ? 'premium' : 'secondary'}
                onClick={() => onBuyNow?.(pkg)}
              >
                Buy Now
              </Button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
