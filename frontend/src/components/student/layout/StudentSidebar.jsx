import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Building2,
  BookOpen,
  FileText,
  Calendar,
  FolderOpen,
  Users,
  Package,
  User,
  Settings,
  LogOut,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useStudentTier } from '@/hooks/useStudentTier';

const navItems = [
  { to: '/student', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/student/universities', icon: Building2, label: 'Schools' },
  { to: '/student/programs', icon: BookOpen, label: 'Programs' },
  { to: '/student/applications', icon: FileText, label: 'Applications' },
  { to: '/student/events', icon: Calendar, label: 'Events' },
  { to: '/student/resources', icon: FolderOpen, label: 'Resources' },
  { to: '/student/mentors', icon: Users, label: 'Mentors', premium: true },
  { to: '/student/packages', icon: Package, label: 'Plans' },
];

const bottomItems = [
  { to: '/student/profile', icon: User, label: 'Profile' },
  { to: '/student/settings', icon: Settings, label: 'Settings' },
];

export function StudentSidebar({ onNavigate }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isPremium, tierLabel } = useStudentTier();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (to, end) => {
    if (end) return pathname === to;
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  const linkClass = (active) =>
    cn(
      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
      active
        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    );

  return (
    <aside className="flex h-full w-[var(--sidebar-width)] flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="px-5 py-6">
        <Link to="/student" className="flex items-center gap-2.5 font-display text-lg font-semibold text-slate-900 dark:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            <GraduationCap className="h-5 w-5" />
          </span>
          MBA Path Pro
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Student navigation">
        {navItems.map((item) => {
          const active = isActive(item.to, item.end);
          const locked = item.premium && !isPremium;
          return (
            <Link key={item.to} to={item.to} onClick={onNavigate} className={cn(linkClass(active), locked && 'opacity-70')}>
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {locked && <Lock className="h-3.5 w-3.5" />}
            </Link>
          );
        })}

        <div className="my-3 border-t border-slate-100 dark:border-slate-800" />

        {bottomItems.map((item) => (
          <Link key={item.to} to={item.to} onClick={onNavigate} className={linkClass(isActive(item.to))}>
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
        <Badge variant={isPremium ? 'default' : 'warning'} className="mt-2">
          {tierLabel}
        </Badge>
        <Button variant="ghost" size="sm" className="mt-3 w-full justify-start text-slate-600" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
