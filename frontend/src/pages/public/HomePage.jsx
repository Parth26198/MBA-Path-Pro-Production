import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Calendar, Star, TrendingUp } from 'lucide-react';
import { publicApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { FeaturedSchoolCard } from '@/components/public/FeaturedSchoolCard';
import { HeroJourneyBar } from '@/components/public/HeroJourneyBar';
import { HeroJourneyCard } from '@/components/public/HeroJourneyCard';
import { TopDestinationsSection } from '@/components/public/TopDestinationsSection';
import { WhyMbaSection } from '@/components/public/WhyMbaSection';
import { useAuthStore, getDashboardPath } from '@/store/authStore';
import { scrollToSection } from '@/lib/scrollToSection';
import { formatCurrency, normalizeAnnualRupees } from '@/lib/utils';
import {
  DESTINATION_CHIPS,
  EXPLORE_PROGRAMS,
  GLOBAL_MBA_SCHOOLS,
  HERO_IMAGE,
  INDIAN_MBA_SCHOOLS,
  PARTNER_SCHOOLS,
  RESOURCES,
  SCHOLARSHIPS,
  SUCCESS_STORIES,
  TOP_MBA_RANKINGS,
  UPCOMING_EVENTS,
} from '@/constants/homepageData';
import '@/styles/homepage.css';

function SectionTitle({ eyebrow, title, subtitle, center }) {
  return (
    <div className={center ? 'text-center mx-auto max-w-2xl' : 'max-w-2xl'}>
      {eyebrow && <p className="mba-eyebrow">{eyebrow}</p>}
      <h2 className="mba-heading mt-2 text-2xl md:text-3xl lg:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function RankingCard({ school, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="mba-card w-[300px] shrink-0"
    >
      <div className="mba-card-visual">
        <img src={school.image} alt={school.name} loading="lazy" />
        <span className="mba-rank-badge">#{school.rank}</span>
        <div className="absolute bottom-3 left-3 z-[2] text-white">
          <p className="text-lg font-bold">{school.short}</p>
          <p className="text-xs opacity-90">{school.country}</p>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-slate-900">{school.name}</h3>
        <dl className="mba-school-meta">
          <div>
            <dt>Fees</dt>
            <dd>{school.tuition}</dd>
          </div>
          <div>
            <dt>Avg Package</dt>
            <dd>{school.salary}</dd>
          </div>
          <div>
            <dt>GMAT</dt>
            <dd>{school.gmat}+</dd>
          </div>
          <div>
            <dt>Country</dt>
            <dd>{school.country}</dd>
          </div>
        </dl>
      </div>
    </motion.article>
  );
}

export default function HomePage() {
  const { token, user, profile } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: collegesRes } = useQuery({
    queryKey: ['featured-colleges'],
    queryFn: publicApi.featuredColleges,
  });

  const apiColleges = collegesRes?.data || [];

  const enrichSchools = (schools) =>
    schools.map((school) => {
      const apiMatch = apiColleges.find((c) => c.name === school.name || c.slug === school.id);
      return {
        ...school,
        ...(apiMatch && {
          image: apiMatch.cover_banner_url || school.image,
          fees: apiMatch.fees_min ?? school.fees,
          avgPackage: normalizeAnnualRupees(apiMatch.avg_package) ?? school.avgPackage,
          highestPackage:
            normalizeAnnualRupees(apiMatch.highest_package) ?? school.highestPackage,
          exams: apiMatch.accepted_exams ?? school.exams,
        }),
      };
    });

  const indianSchools = enrichSchools(INDIAN_MBA_SCHOOLS);
  const globalSchools = enrichSchools(GLOBAL_MBA_SCHOOLS);

  const journeyPath = token ? getDashboardPath(user?.role, profile) : '/register';

  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target) return undefined;
    const timer = window.setTimeout(() => {
      scrollToSection(target);
      navigate('.', { replace: true, state: {} });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [location.state?.scrollTo, navigate]);

  return (
    <div className="mba-home">
      {/* ── PREMIUM MBA JOURNEY HERO ── */}
      <section className="mba-hero-premium">
        <div className="mba-hero-premium__bg">
          <img src={HERO_IMAGE} alt="MBA classroom discussion" />
        </div>
        <div className="mba-hero-premium__overlay" />
        <div className="mba-hero-premium__content mba-container">
          <div className="mba-hero-premium__grid">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <span className="mba-hero-badge">Trusted by 15,000+ MBA Aspirants</span>
              <h1 className="mba-heading mt-5 text-balance">Find Your Ideal MBA Program</h1>
              <p className="mba-hero-premium__sub mt-5">
                Discover top business schools, compare programs, and build your MBA journey step by step —
                trusted by thousands of aspirants across India and the world.
              </p>

              <div className="mba-hero-destinations">
                {DESTINATION_CHIPS.map((dest) => (
                  <span key={dest.label} className="mba-hero-destination">
                    <span aria-hidden>{dest.flag}</span>
                    {dest.label}
                  </span>
                ))}
              </div>

              <div className="mba-hero-ctas">
                <Link to={journeyPath} className="mba-hero-cta-primary inline-flex items-center justify-center">
                  Start My MBA Journey
                </Link>
                <Link to="/colleges" className="mba-hero-cta-secondary inline-flex items-center justify-center">
                  Explore Top Schools
                </Link>
              </div>
            </motion.div>

            <HeroJourneyCard />
          </div>
        </div>
      </section>

      <HeroJourneyBar />

      <WhyMbaSection />

      <TopDestinationsSection />

      {/* ── TOP INDIAN MBA SCHOOLS ── */}
      <section id="schools" className="mba-section mba-section-alt">
        <div className="mba-container">
          <SectionTitle
            eyebrow="India's Finest"
            title="Top Indian MBA Schools"
            subtitle="Explore IIMs, ISB, XLRI and India's most prestigious B-schools — real campuses, real outcomes, all in INR."
          />
          <div className="mba-carousel mt-8">
            {indianSchools.map((school, i) => (
              <FeaturedSchoolCard key={school.id} college={school} index={i} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline" className="rounded-xl" asChild>
              <Link to="/colleges">
                View all Indian schools <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── GLOBAL B-SCHOOLS ── */}
      <section className="mba-section mba-section-muted">
        <div className="mba-container">
          <SectionTitle
            eyebrow="Global Excellence"
            title="World's Leading MBA Programs"
            subtitle="INSEAD, HEC Paris, LBS, NUS, Wharton — aspire globally with trusted rankings and placement data."
          />
          <div className="mba-carousel mt-8">
            {globalSchools.map((school, i) => (
              <FeaturedSchoolCard key={school.id} college={school} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── RANKINGS ── */}
      <section id="rankings" className="mba-section mba-section-muted">
        <div className="mba-container">
          <SectionTitle
            eyebrow="Rankings"
            title="Top MBA Programs Worldwide"
            subtitle="Compare fees, average packages, and GMAT benchmarks — all in INR."
          />
          <div className="mba-carousel mt-6">
            {TOP_MBA_RANKINGS.map((s, i) => (
              <RankingCard key={s.id} school={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section id="programs" className="mba-section mba-section-alt">
        <div className="mba-container">
          <SectionTitle
            eyebrow="Programs"
            title="Explore MBA Formats"
            subtitle="Full-time, executive, PGDM, and specialized — find the format that fits your life."
          />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {EXPLORE_PROGRAMS.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="mba-card group"
              >
                <div className="mba-card-visual h-36">
                  <img src={p.image} alt="" loading="lazy" />
                  <span className="absolute top-3 right-3 z-[2] rounded-full bg-white/95 px-2.5 py-0.5 text-[0.625rem] font-bold uppercase text-[#0F172A]">
                    {p.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-lg text-slate-900">{p.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {p.duration} · {p.format}
                  </p>
                  <Link to="/register" className="mt-3 inline-flex items-center text-sm font-bold text-[#4F46E5] hover:underline">
                    Explore <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCHOLARSHIPS ── */}
      <section id="scholarships" className="mba-section mba-section-muted">
        <div className="mba-container">
          <SectionTitle
            eyebrow="Scholarships"
            title="₹20Cr+ in MBA Scholarships"
            subtitle="Merit, need-based, and diversity awards from partner schools."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCHOLARSHIPS.map((s, i) => (
              <motion.article
                key={s.school}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="mba-card p-5"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">{s.type}</p>
                <h3 className="mt-2 font-display font-bold text-slate-900">{s.school}</h3>
                <p className="mt-2 font-display text-2xl font-bold text-[#0F172A]">{s.amount}</p>
                <p className="mt-2 text-xs text-slate-500">Deadline: {s.deadline}</p>
                <Button variant="outline" size="sm" className="mt-4 rounded-lg w-full" asChild>
                  <Link to="/register">Check eligibility</Link>
                </Button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUCCESS STORIES ── */}
      <section id="success-stories" className="mba-section mba-section-alt">
        <div className="mba-container">
          <SectionTitle
            eyebrow="Outcomes"
            title="Success Stories"
            subtitle="Real admits. Real career transformation. Measurable salary growth."
            center
          />
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {SUCCESS_STORIES.map((story, i) => (
              <motion.blockquote
                key={story.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="mba-success-card"
              >
                <div className="flex items-center gap-3">
                  <img src={story.image} alt="" className="mba-success-photo" />
                  <div>
                    <p className="font-display font-bold text-slate-900">{story.name}</p>
                    <p className="text-xs text-slate-500">{story.role}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">&ldquo;{story.quote}&rdquo;</p>
                <div className="mba-success-growth">
                  <TrendingUp className="h-5 w-5 shrink-0 text-[#16A34A]" />
                  <div className="text-sm">
                    <p className="font-bold text-[#0F172A]">
                      {story.beforeRole} → {story.afterRole}
                    </p>
                    <p className="text-[#16A34A] font-semibold">
                      {formatCurrency(story.salaryBefore)} → {formatCurrency(story.salaryAfter)}
                    </p>
                  </div>
                </div>
                <footer className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-sm font-bold text-[#4F46E5]">Admitted: {story.school}</p>
                  <span className="text-xs font-semibold text-slate-400">Class of {story.admit}</span>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section id="events" className="mba-section mba-section-muted">
        <div className="mba-container">
          <SectionTitle
            eyebrow="Events"
            title="Upcoming MBA Events"
            subtitle="Webinars, admission masterclasses, GMAT sessions, and school connect events."
          />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {UPCOMING_EVENTS.map((event, i) => (
              <motion.article
                key={event.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="mba-card overflow-hidden"
              >
                <div className="h-32 overflow-hidden">
                  <img
                    src={event.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <span className="text-[0.625rem] font-bold uppercase tracking-wider text-[#4F46E5]">
                    {event.type}
                  </span>
                  <h3 className="mt-2 font-display font-bold text-slate-900">{event.title}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" /> {event.date} · {event.time}
                  </p>
                  <Button variant="ghost" size="sm" className="mt-3 px-0 text-[#4F46E5] font-bold" asChild>
                    <Link to="/register">Reserve spot</Link>
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESOURCES ── */}
      <section id="resources" className="mba-section mba-section-alt">
        <div className="mba-container">
          <SectionTitle
            eyebrow="Resources"
            title="Application Resources"
            subtitle="GMAT, CAT, essays, resumes, interviews — everything to build a winning application."
          />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {RESOURCES.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="mba-card p-4 text-center"
              >
                <span className="text-2xl">{r.icon}</span>
                <h3 className="mt-2 text-sm font-bold text-slate-900">{r.title}</h3>
                <p className="mt-1 text-[0.6875rem] text-slate-500 leading-snug">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNER SCHOOLS ── */}
      <section id="partners" className="mba-section mba-section-muted border-y border-slate-200/60">
        <div className="mba-container text-center">
          <SectionTitle
            eyebrow="Partners"
            title="100+ Partner Institutions"
            subtitle="Trusted by leading business schools across India, Europe, Asia, and the Americas."
            center
          />
          <div className="mba-partner-scroll mt-8">
            {PARTNER_SCHOOLS.map((p) => (
              <span key={p.name} className="mba-partner-logo">
                {p.logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="mba-section">
        <div className="mba-container">
          <div className="mba-cta-section">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Start your journey</p>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-4xl">Your MBA discovery starts here</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/75 md:text-base">
              Build your profile, get AI-matched recommendations, and explore 250+ business schools — free to start.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="rounded-xl bg-white text-[#0F172A] hover:bg-slate-100" asChild>
                <Link to="/register">
                  Create Free Account <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link to="/colleges">
                  <Building2 className="mr-1 h-4 w-4" /> Browse Schools
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
