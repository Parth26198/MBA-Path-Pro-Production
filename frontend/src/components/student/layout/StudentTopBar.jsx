import { Link } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useStudentTier } from '@/hooks/useStudentTier';
import { NotificationCenter } from '@/components/shared/NotificationCenter';

export function StudentTopBar() {
  const user = useAuthStore((s) => s.user);
  const { profileCompletion } = useStudentTier();
  const firstName = user?.name?.split(' ')[0] || 'Student';

  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md lg:px-8 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="min-w-0 lg:hidden">
        <p className="truncate font-display text-base font-semibold text-slate-900 dark:text-white">{firstName}</p>
      </div>

      <div className="hidden max-w-lg flex-1 lg:block">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Search schools, programs, resources..."
            aria-label="Search student portal"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/student/profile"
          className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:flex dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <span className="font-semibold text-brand-600">{profileCompletion}%</span>
          Profile complete
        </Link>

        <NotificationCenter />

        <Link
          to="/student/profile"
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
            {firstName.charAt(0)}
          </div>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
        </Link>
      </div>
    </header>
  );
}
