import { motion } from 'framer-motion';
import { Target, Users, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold">About MBA Path Pro</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          We are an enterprise MBA admission management platform built for consultancies who run serious admission businesses — not hobby projects.
        </p>
      </motion.div>
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {[
          { icon: Target, title: 'Mission', desc: 'Democratize access to top MBA programs through technology-enabled personalized guidance.' },
          { icon: Users, title: 'Team', desc: '12+ years of admission consulting experience powering our platform workflows.' },
          { icon: Zap, title: 'Technology', desc: 'Real-time tracking, trainer-controlled workflows, and investor-ready analytics.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border bg-white p-8 shadow-sm">
            <item.icon className="h-10 w-10 text-brand-600" />
            <h3 className="mt-4 font-display text-xl font-bold">{item.title}</h3>
            <p className="mt-2 text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
