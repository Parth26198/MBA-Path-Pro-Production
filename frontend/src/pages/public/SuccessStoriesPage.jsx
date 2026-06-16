import { motion } from 'framer-motion';

const stories = [
  { student: 'Paresh Dahivelkar', from: 'Engineering', to: 'SP Jain, IIM A, ISB', package: 'Growth MBA', result: '3 active applications with dedicated trainer' },
  { student: 'Ananya K.', from: 'Commerce', to: 'IIM Bangalore', package: 'Elite MBA', result: 'Admitted with scholarship' },
  { student: 'Vikram R.', from: 'IT', to: 'ISB Hyderabad', package: 'Growth MBA', result: '1-year PGP admit' },
];

export default function SuccessStoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h1 className="font-display text-4xl font-bold">Success Stories</h1>
      <p className="mt-2 text-slate-600">Real outcomes from our admission operating system</p>
      <div className="mt-12 space-y-6">
        {stories.map((s, i) => (
          <motion.div
            key={s.student}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 rounded-2xl border bg-white p-8 md:flex-row md:items-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
              {s.student.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">{s.student}</h2>
              <p className="text-brand-600">{s.from} → {s.to}</p>
              <p className="mt-2 text-slate-600">{s.result}</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-800">{s.package}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
