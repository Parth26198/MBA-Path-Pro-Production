import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UpgradeBanner() {
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">Unlock applications & mentorship</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upgrade to apply to business schools and access premium admission support.
          </p>
        </div>
      </div>
      <Button className="shrink-0" asChild>
        <Link to="/student/packages">View plans</Link>
      </Button>
    </div>
  );
}
