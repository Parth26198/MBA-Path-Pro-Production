import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Globe, Building2, BookOpen, Star, Quote } from 'lucide-react';

const VALUE_PROPS = [
  { title: 'Personalized School Matches', desc: 'AI-powered shortlists based on your profile' },
  { title: 'Admission Tracker', desc: 'Deadlines, documents, and application status' },
  { title: 'Program Recommendations', desc: 'MBA, PGDM, EMBA & global programs' },
  { title: 'Application Timeline', desc: 'Step-by-step roadmap to your admit' },
];

const STATS = [
  { value: '1200+', label: 'Programs', icon: BookOpen },
  { value: '250+', label: 'Business Schools', icon: Building2 },
  { value: '98%', label: 'Satisfaction', icon: Globe },
];

const TESTIMONIALS = [
  {
    quote: 'MBA Path Pro helped me shortlist the right schools in days. The match scores were spot on.',
    name: 'Priya S.',
    school: 'Admitted to ISB',
  },
  {
    quote: 'The guided profile builder made my application strategy so much clearer.',
    name: 'Rahul M.',
    school: 'Admitted to IIM Ahmedabad',
  },
];

const UNIVERSITY_LOGOS = ['IIM', 'ISB', 'XLRI', 'SPJ', 'HEC', 'LBS'];

export function RegisterBrandPanel() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0F172A] px-8 py-10 text-white lg:px-12 lg:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(79,70,229,0.2),_transparent_50%)]" />
      <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl" />
      <div className="absolute -left-10 bottom-10 h-56 w-56 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative z-10">
        <Link to="/" className="inline-flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <GraduationCap className="h-6 w-6" />
          </span>
          <span className="font-display text-xl font-semibold">MBA Path Pro</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-12 max-w-lg"
        >
          <h2 className="font-display text-3xl font-semibold leading-tight lg:text-4xl">
            Your MBA journey starts with the right match
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Discover programs, compare business schools, and build a personalized admission path — trusted by ambitious professionals worldwide.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 grid gap-3 sm:grid-cols-2"
        >
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-sm font-bold">{v.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{v.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative mt-10 hidden lg:block"
        >
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-end justify-between gap-4">
              {[72, 88, 65, 94, 78].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                  className="w-10 rounded-t-xl bg-gradient-to-t from-brand-600/80 to-indigo-400/60"
                />
              ))}
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-400">Match score distribution</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 grid grid-cols-3 gap-4"
        >
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <s.icon className="h-5 w-5 text-indigo-300" />
              <p className="mt-2 font-display text-xl font-bold">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-10 space-y-4"
        >
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <Quote className="h-4 w-4 text-indigo-300" />
              <p className="mt-2 text-sm leading-relaxed text-slate-300">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-400">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {t.school}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-10"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trusted by students targeting</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {UNIVERSITY_LOGOS.map((logo) => (
              <span
                key={logo}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300"
              >
                {logo}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
