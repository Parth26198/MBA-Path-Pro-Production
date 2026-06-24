import { motion } from 'framer-motion';
import { Globe2, LineChart, Network, Trophy } from 'lucide-react';

const REASONS = [
  {
    icon: LineChart,
    title: 'Accelerate Your Career',
    desc: 'MBA graduates see 80–120% average salary growth at top Indian and global B-schools.',
  },
  {
    icon: Network,
    title: 'Build a Global Network',
    desc: 'Join alumni communities at IIMs, ISB, INSEAD, and 250+ partner institutions worldwide.',
  },
  {
    icon: Trophy,
    title: 'Lead with Confidence',
    desc: 'Develop strategic thinking, leadership, and decision-making skills employers value most.',
  },
  {
    icon: Globe2,
    title: 'Open Global Opportunities',
    desc: 'From consulting in Mumbai to finance in London — an MBA unlocks doors across industries.',
  },
];

export function WhyMbaSection() {
  return (
    <section id="why-mba" className="mba-section mba-section-alt">
      <div className="mba-container">
        <div className="text-center mx-auto max-w-2xl">
          <p className="mba-eyebrow">Your future starts here</p>
          <h2 className="mba-heading mt-2 text-2xl md:text-3xl lg:text-4xl">Why Pursue an MBA?</h2>
          <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">
            Whether you aim for IIM Ahmedabad, ISB, or a global top-10 — an MBA is the most proven path to
            leadership, impact, and career transformation.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="mba-card p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5]">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
