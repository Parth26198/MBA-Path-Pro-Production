import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  Calendar,
  Bell,
  LogOut,
  Building2,
  BarChart3,
  ClipboardList,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '@/components/shared/NotificationCenter';

const menus = {
  ADMIN: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/trainers', icon: GraduationCap, label: 'Trainers' },
    { to: '/admin/applications', icon: FileText, label: 'Applications' },
    { to: '/admin/colleges', icon: Building2, label: 'Colleges' },
    { to: '/admin/packages', icon: ClipboardList, label: 'Packages' },
    { to: '/admin/payments', icon: BarChart3, label: 'Payments' },
    { to: '/admin/documents', icon: FileText, label: 'Documents' },
    { to: '/admin/audit', icon: Bell, label: 'Audit Logs' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ],
  TRAINER: [
    { to: '/trainer', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/trainer/students', icon: Users, label: 'Students' },
    { to: '/trainer/applications', icon: FileText, label: 'Applications' },
    { to: '/trainer/preparation', icon: ClipboardList, label: 'Preparation' },
    { to: '/trainer/sessions', icon: Calendar, label: 'Sessions' },
    { to: '/trainer/documents', icon: FileText, label: 'Documents' },
    { to: '/trainer/colleges', icon: Building2, label: 'Colleges' },
  ],
  STUDENT: [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/applications', icon: FileText, label: 'Applications' },
    { to: '/student/preparation', icon: BookOpen, label: 'Preparation' },
    { to: '/student/documents', icon: ClipboardList, label: 'Documents' },
    { to: '/student/payments', icon: BarChart3, label: 'Payments' },
  ],
};

function NavLinks({ items, role, pathname, onNavigate }) {
  const base = `/${role.toLowerCase()}`;

  return items.map((item) => {
    const active =
      pathname === item.to || (item.to !== base && pathname.startsWith(item.to));

    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    );
  });
}

export function DashboardLayout({ role }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const items = menus[role] || [];
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6 font-display font-bold text-brand-700">
          <GraduationCap className="h-6 w-6" />
          MBA Path Pro
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <NavLinks items={items} role={role} pathname={pathname} />
        </nav>
        <div className="border-t p-4">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="truncate text-xs text-slate-500">{user?.role}</p>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2 font-display font-bold text-brand-700">
                <GraduationCap className="h-6 w-6" />
                MBA Path Pro
              </div>
              <button type="button" onClick={closeMobile} className="rounded-lg p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              <NavLinks items={items} role={role} pathname={pathname} onNavigate={closeMobile} />
            </nav>
            <div className="border-t p-4">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.role}</p>
              <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col pb-16 lg:pb-0">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold capitalize">{role.toLowerCase()} Portal</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t bg-white lg:hidden">
        {items.slice(0, 4).map((item) => {
          const base = `/${role.toLowerCase()}`;
          const active =
            pathname === item.to || (item.to !== base && pathname.startsWith(item.to));

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium',
                active ? 'text-brand-600' : 'text-slate-500'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate px-1">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium text-slate-500"
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
