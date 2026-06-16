import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { getDashboardPath } from '@/store/authStore';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/colleges', label: 'Colleges' },
  { to: '/packages', label: 'Packages' },
  { to: '/success-stories', label: 'Success Stories' },
  { to: '/contact', label: 'Contact' },
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { token, user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-brand-700">
            <GraduationCap className="h-7 w-7" />
            MBA Path Pro
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium transition-colors hover:text-brand-600 ${
                  pathname === item.to ? 'text-brand-600' : 'text-slate-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {token ? (
              <Button asChild>
                <Link to={getDashboardPath(user?.role)}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/packages">Get Started</Link>
                </Button>
              </>
            )}
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t bg-white px-4 py-4 md:hidden">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} className="block py-2" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link to="/login" className="block py-2" onClick={() => setOpen(false)}>Login</Link>
          </motion.div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-brand-950 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <p className="font-display text-lg font-bold text-white">MBA Path Pro</p>
              <p className="mt-2 text-sm">India&apos;s premium MBA admission operating system for consultancies.</p>
            </div>
            <div>
              <p className="font-semibold text-white">Platform</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li><Link to="/packages">Packages</Link></li>
                <li><Link to="/colleges">Colleges</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white">Company</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white">Contact</p>
              <p className="mt-2 text-sm">hello@mbapathpro.com</p>
              <p className="text-sm">+91 98765 43210</p>
            </div>
          </div>
          <p className="mt-8 border-t border-white/10 pt-6 text-center text-xs">© 2025 MBA Path Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
