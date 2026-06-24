import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Building2, FileText, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StudentSidebar } from './StudentSidebar';
import { StudentTopBar } from './StudentTopBar';
import { CompareTray } from '@/components/student/explorer/CompareTray';

const mobileTabs = [
  { to: '/student', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/student/universities', icon: Building2, label: 'Universities' },
  { to: '/student/applications', icon: FileText, label: 'Apps' },
];

export function StudentAppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (to, end) => {
    if (end) return pathname === to;
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <div className="student-portal flex min-h-screen">
      <div className="hidden lg:flex">
        <StudentSidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
          <div className="absolute left-0 top-0 h-full shadow-xl">
            <StudentSidebar onNavigate={() => setMobileOpen(false)} />
            <button type="button" className="absolute right-3 top-4 rounded-lg p-2 hover:bg-slate-100" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <div className="flex items-center gap-2 border-b bg-white px-4 py-2 lg:hidden">
          <button type="button" className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display font-bold text-brand-700">MBA Path Pro</span>
        </div>
        <StudentTopBar />
        <main className="flex-1 overflow-auto bg-surface-bg p-5 lg:p-10 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t bg-white lg:hidden">
        {mobileTabs.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium',
              isActive(item.to, item.end) ? 'text-brand-600' : 'text-slate-500'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium text-slate-500"
        >
          <MoreHorizontal className="h-5 w-5" />
          More
        </button>
      </nav>

      <CompareTray />
    </div>
  );
}
