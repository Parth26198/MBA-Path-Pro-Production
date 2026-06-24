import { Link, Outlet } from 'react-router-dom';

import { GraduationCap, Menu, X } from 'lucide-react';

import { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';

import { useAuthStore, getDashboardPath } from '@/store/authStore';

import { LANDING_NAV } from '@/constants/landingNav';

import { useLandingSectionNav } from '@/hooks/useLandingSectionNav';



export function PublicLayout() {

  const [open, setOpen] = useState(false);

  const { token, user, profile } = useAuthStore();

  const { activeSection, navigateToSection, isHome } = useLandingSectionNav();



  const handleSectionClick = (sectionId) => {

    navigateToSection(sectionId);

    setOpen(false);

  };



  const navLinkClass = (sectionId) =>

    `text-sm font-semibold transition-colors hover:text-[#4F46E5] ${

      isHome && activeSection === sectionId ? 'text-[#4F46E5]' : 'text-slate-600'

    }`;



  return (

    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#F8FAFC]/95 backdrop-blur-md">

        <div className="platform-container flex h-[68px] items-center justify-between">

          <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold text-[#0F172A]">

            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] text-white">

              <GraduationCap className="h-5 w-5" />

            </span>

            MBA Path Pro

          </Link>



          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">

            {LANDING_NAV.map((item) => (

              <button

                key={item.id}

                type="button"

                onClick={() => handleSectionClick(item.id)}

                className={navLinkClass(item.id)}

                aria-current={isHome && activeSection === item.id ? 'true' : undefined}

              >

                {item.label}

              </button>

            ))}

          </nav>



          <div className="hidden items-center gap-3 lg:flex">

            {token ? (

              <Button className="rounded-xl bg-[#0F172A] hover:bg-[#1E293B]" asChild>

                <Link to={getDashboardPath(user?.role, profile)}>Dashboard</Link>

              </Button>

            ) : (

              <>

                <Button variant="ghost" className="font-semibold text-slate-700" asChild>

                  <Link to="/login">Login</Link>

                </Button>

                <Button className="rounded-xl bg-[#0F172A] hover:bg-[#1E293B]" asChild>

                  <Link to="/register">Create Account</Link>

                </Button>

              </>

            )}

          </div>



          <button

            type="button"

            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"

            onClick={() => setOpen(!open)}

            aria-label={open ? 'Close menu' : 'Open menu'}

          >

            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}

          </button>

        </div>



        <AnimatePresence>

          {open && (

            <motion.div

              initial={{ height: 0, opacity: 0 }}

              animate={{ height: 'auto', opacity: 1 }}

              exit={{ height: 0, opacity: 0 }}

              className="overflow-hidden border-t lg:hidden"

            >

              <div className="platform-container space-y-1 py-4">

                {LANDING_NAV.map((item) => (

                  <button

                    key={item.id}

                    type="button"

                    onClick={() => handleSectionClick(item.id)}

                    className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 ${

                      isHome && activeSection === item.id

                        ? 'bg-indigo-50 text-[#4F46E5] font-semibold'

                        : 'text-slate-700 dark:text-slate-300'

                    }`}

                    aria-current={isHome && activeSection === item.id ? 'true' : undefined}

                  >

                    {item.label}

                  </button>

                ))}

                <div className="flex gap-2 pt-3">

                  <Button variant="outline" className="flex-1" asChild>

                    <Link to="/login" onClick={() => setOpen(false)}>Login</Link>

                  </Button>

                  <Button className="flex-1" asChild>

                    <Link to="/register" onClick={() => setOpen(false)}>Create Account</Link>

                  </Button>

                </div>

              </div>

            </motion.div>

          )}

        </AnimatePresence>

      </header>



      <main className="flex-1">

        <Outlet />

      </main>



      <footer className="border-t border-slate-200 bg-[#0F172A] text-white">

        <div className="platform-container py-12">

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

            <div>

              <p className="font-display text-lg font-bold text-white">MBA Path Pro</p>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">

                The modern MBA discovery and admission platform for ambitious professionals worldwide.

              </p>

            </div>

            <div>

              <p className="text-sm font-semibold text-white">Explore</p>

              <ul className="mt-3 space-y-2 text-sm text-slate-400">

                <li>

                  <button type="button" className="hover:text-white" onClick={() => handleSectionClick('schools')}>

                    Business Schools

                  </button>

                </li>

                <li>

                  <button type="button" className="hover:text-white" onClick={() => handleSectionClick('programs')}>

                    Programs

                  </button>

                </li>

                <li>

                  <button type="button" className="hover:text-white" onClick={() => handleSectionClick('events')}>

                    Events

                  </button>

                </li>

                <li>

                  <button type="button" className="hover:text-white" onClick={() => handleSectionClick('resources')}>

                    Resources

                  </button>

                </li>

              </ul>

            </div>

            <div>

              <p className="text-sm font-semibold text-white">Company</p>

              <ul className="mt-3 space-y-2 text-sm text-slate-400">

                <li>

                  <button type="button" className="hover:text-white" onClick={() => handleSectionClick('why-mba')}>

                    Why MBA

                  </button>

                </li>

                <li>

                  <button type="button" className="hover:text-white" onClick={() => handleSectionClick('success-stories')}>

                    Success Stories

                  </button>

                </li>

                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>

              </ul>

            </div>

            <div>

              <p className="text-sm font-semibold text-white">Get started</p>

              <p className="mt-3 text-sm text-slate-400">Create a free account to unlock personalized recommendations.</p>

              <Button className="mt-4 rounded-xl bg-white text-[#0F172A] hover:bg-slate-100" asChild>

                <Link to="/register">Create Free Account</Link>

              </Button>

            </div>

          </div>

          <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">

            © {new Date().getFullYear()} MBA Path Pro. All rights reserved.

          </p>

        </div>

      </footer>

    </div>

  );

}


