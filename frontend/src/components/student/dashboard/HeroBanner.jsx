import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, GraduationCap, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroBanner({ hero, userName }) {
  const firstName = userName?.split(' ')[0] || 'there';
  const headline = hero?.headline || `Welcome back, ${firstName}`;
  const subheadline =
    hero?.subheadline ||
    'Your personalized MBA journey — explore matches, track applications, and stay ahead of deadlines.';

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#0F172A] p-8 text-white md:p-10"
    >
      <div className="absolute inset-0 opacity-30">
        <img
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/90 to-[#0F172A]/70" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" /> Your MBA Journey
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">{headline}</h1>
          <p className="mt-3 text-base text-slate-300">{subheadline}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="rounded-xl bg-white text-[#0F172A] hover:bg-slate-100" asChild>
            <Link to={hero?.primary_cta?.path || '/student/universities'}>
              {hero?.primary_cta?.label || 'Explore Schools'} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10"
            asChild
          >
            <Link to={hero?.secondary_cta?.path || '/student/programs'}>
              {hero?.secondary_cta?.label || 'Browse Programs'}
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: GraduationCap, label: 'Saved Schools', value: 'Track shortlist' },
          { icon: Calendar, label: 'Deadlines', value: 'Stay on schedule' },
          { icon: Search, label: 'AI Matches', value: 'Personalized picks' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
          >
            <item.icon className="h-5 w-5 text-indigo-300" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className="text-sm font-semibold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
