import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Building2,
  MessageCircle,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { publicApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PackageCards } from '@/components/packages/PackageCards';
import { BuyNowModal } from '@/components/auth/BuyNowModal';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const [buyPkg, setBuyPkg] = useState(null);
  const setSelectedPackage = useAuthStore((s) => s.setSelectedPackage);

  const { data: packagesRes } = useQuery({ queryKey: ['packages'], queryFn: publicApi.packages });
  const {
    data: collegesRes,
    isLoading: collegesLoading,
    isError: collegesError,
  } = useQuery({ queryKey: ['featured-colleges'], queryFn: publicApi.featuredColleges });
  const { data: statsRes } = useQuery({ queryKey: ['stats'], queryFn: publicApi.stats });

  const packages = packagesRes?.data || [];
  const colleges = collegesRes?.data || [];
  const stats = statsRes?.data || {};

  const handleBuy = (pkg) => {
    setSelectedPackage(pkg);
    setBuyPkg(pkg);
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-hero-gradient text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur">
              Trusted by 2,800+ MBA aspirants
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-tight md:text-6xl">
              Your Complete MBA Admission Operating System
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-blue-100">
              End-to-end admission management — from college shortlisting to GD-PI mastery. Built for serious MBA consultancies.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="accent" size="lg" asChild>
                <a href="#packages">Explore Packages <ArrowRight className="h-4 w-4" /></a>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/contact">Book Free Counseling</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b bg-white py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4 lg:px-8">
          {[
            { label: 'Students Placed', value: stats.studentsPlaced || '2,847+', icon: Users },
            { label: 'Partner Colleges', value: stats.partnerColleges || '120+', icon: Building2 },
            { label: 'Success Rate', value: `${stats.successRate || 94}%`, icon: TrendingUp },
            { label: 'Avg Package', value: stats.avgPackage || '18.5 LPA', icon: Award },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-center"
            >
              <s.icon className="mx-auto h-8 w-8 text-brand-600" />
              <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold">Featured B-Schools</h2>
            <p className="mt-2 text-slate-600">Top colleges our students target every season</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collegesLoading && (
              <p className="col-span-full text-center text-sm text-slate-500">Loading featured colleges...</p>
            )}
            {collegesError && (
              <p className="col-span-full text-center text-sm text-red-600">Unable to load featured colleges.</p>
            )}
            {!collegesLoading && !collegesError && colleges.length === 0 && (
              <p className="col-span-full text-center text-sm text-slate-500">No featured colleges yet.</p>
            )}
            {colleges.map((c) => (
              <motion.div key={c.id} whileHover={{ y: -4 }} className="glass rounded-2xl p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 font-bold text-brand-700">
                  {c.name.charAt(0)}
                </div>
                <h3 className="mt-4 font-display font-bold">{c.name}</h3>
                <p className="text-sm text-slate-500">{c.location}</p>
                <p className="mt-2 text-sm">NIRF Rank #{c.ranking}</p>
                <p className="text-sm font-semibold text-brand-600">Avg: {formatCurrency(c.avg_package)}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild><Link to="/colleges">View All Colleges</Link></Button>
          </div>
        </div>
      </section>

      <section id="packages" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold">Premium Admission Packages</h2>
            <p className="mt-2 text-slate-600">Choose the plan that matches your MBA ambition</p>
          </div>
          <div className="mt-12">
            <PackageCards packages={packages} onBuyNow={handleBuy} />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold">Student Success Stories</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Rahul M.', college: 'IIM Ahmedabad', quote: 'MBA Path Pro transformed my SOP and PI prep. Admitted to my dream B-school!' },
              { name: 'Priya S.', college: 'ISB Hyderabad', quote: 'The trainer-led GD sessions gave me the confidence I needed for ISB.' },
              { name: 'Paresh D.', college: 'SP Jain Mumbai', quote: 'Tracking 3 applications with my trainer made the process stress-free.' },
            ].map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex gap-1 text-amber-400">{[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}</div>
                <p className="mt-4 text-slate-600">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 font-semibold">{t.name}</p>
                <p className="text-sm text-brand-600">{t.college}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-950 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <MessageCircle className="mx-auto h-10 w-10 text-brand-300" />
          <h2 className="mt-4 font-display text-2xl font-bold">Ready to start your MBA journey?</h2>
          <p className="mt-2 text-slate-300">Join thousands of aspirants who trust MBA Path Pro</p>
          <Button className="mt-6" variant="accent" size="lg" onClick={() => packages[1] && handleBuy(packages[1])}>
            Get Started Today
          </Button>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold">FAQ</h2>
          <div className="mt-8 space-y-4">
            {[
              { q: 'Can students mark tasks complete?', a: 'No. Only trainers verify and complete checklist items — ensuring quality control.' },
              { q: 'How does package college limit work?', a: 'Each package allows a fixed number of college applications tracked in your dashboard.' },
              { q: 'Is payment integrated?', a: 'Payment is simulated for demo. Production supports Razorpay/Stripe integration.' },
            ].map((f) => (
              <details key={f.q} className="rounded-xl border bg-white p-4">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-sm text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <BuyNowModal open={!!buyPkg} onOpenChange={(o) => !o && setBuyPkg(null)} package={buyPkg} />
    </div>
  );
}
