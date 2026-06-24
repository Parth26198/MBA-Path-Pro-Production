import { ArrowRight, Check, Loader2, Sparkles, MapPin, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MatchScoreBadge } from '@/components/student/shared/MatchScoreBadge';
import { StepHero, StepBody } from '@/components/onboarding/OnboardingShell';
import {
  BUDGET_OPTIONS,
  CAREER_GOALS,
  COUNTRY_OPTIONS,
  DEGREE_OPTIONS,
  EXAM_STATUS_OPTIONS,
  EXPERIENCE_OPTIONS,
  GRADUATION_YEARS,
  INDUSTRY_OPTIONS,
  MBA_INTERESTS,
} from '@/constants/onboarding';
import { DEMO_UNIVERSITIES, NEXT_STEPS } from '@/constants/onboardingDemoData';
import { cn, formatFees } from '@/lib/utils';

const GENERATION_MESSAGES = [
  'Analyzing profile…',
  'Matching universities…',
  'Building admission roadmap…',
  'Ranking business schools…',
  'Curating personalized matches…',
];

const COUNTRY_FLAGS = {
  India: '🇮🇳',
  USA: '🇺🇸',
  UK: '🇬🇧',
  Canada: '🇨🇦',
  Europe: '🇪🇺',
  Singapore: '🇸🇬',
};

const PROGRAM_EMOJI = {
  MBA: '🎓',
  'Executive MBA': '💼',
  PGDM: '📋',
  MiM: '🌍',
  'Business Analytics': '📊',
  Finance: '💰',
  Marketing: '📣',
};

const DEGREE_EMOJI = {
  'B.Tech / B.E.': '⚙️',
  'B.Com': '📊',
  BBA: '📈',
  BA: '📚',
  'B.Sc': '🔬',
  MBBS: '🩺',
  Other: '✨',
};
export function WelcomeStep({ userName, onContinue, saving }) {
  const first = userName?.split(' ')[0];

  return (
    <>
      <StepHero
        eyebrow="Your MBA journey"
        emoji="🎓"
        title={first ? `Welcome, ${first}` : 'Welcome to MBA Path Pro'}
        subtitle="We'll guide you through a personalized discovery journey — from your background to AI-matched business schools."
      />
      <StepBody className="onboarding-content--wide">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { emoji: '📖', title: 'Tell your story', desc: 'Education & professional experience' },
            { emoji: '🌍', title: 'Define your goals', desc: 'Countries, budget & career path' },
            { emoji: '✨', title: 'Get matched', desc: 'AI-ranked universities & programs' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="journey-card journey-card--selectable"
            >
              <span className="text-3xl">{item.emoji}</span>
              <p className="mt-3 font-display text-base font-bold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
            Schools students like you explore
          </p>
          <div className="journey-preview-strip">
            {DEMO_UNIVERSITIES.slice(0, 5).map((u) => (
              <div key={u.id} className="journey-preview-card">
                <p className="journey-preview-card-rank">Rank #{u.ranking}</p>
                <p className="journey-preview-card-name">{u.name}</p>
                <p className="journey-preview-card-loc">{u.location}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center pb-6">
          <Button
            size="lg"
            className="h-14 rounded-2xl bg-slate-900 px-12 text-base hover:bg-slate-800"
            onClick={onContinue}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Starting…
              </>
            ) : (
              <>
                Begin your journey <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </StepBody>
    </>
  );
}

export function AcademicStep({ form, setForm }) {
  return (
    <>
      <StepHero
        eyebrow="Education profile"
        emoji="📚"
        title="What's your academic background?"
        subtitle="Select your highest qualification — we'll match eligibility and program fit."
      />
      <StepBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {DEGREE_OPTIONS.map((deg, i) => (
            <motion.button
              key={deg}
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setForm({ ...form, degree: deg })}
              className={cn('wiz-career-card', form.degree === deg && 'wiz-career-card-selected')}
            >
              <span className="text-2xl">{DEGREE_EMOJI[deg] || '🎓'}</span>
              <span className="text-sm font-semibold text-slate-800">{deg}</span>
            </motion.button>
          ))}
        </div>

        {form.degree && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10 space-y-10">
            <div className="journey-card">
              <p className="mb-4 text-center text-sm font-bold text-slate-700">Year of graduation</p>
              <div className="flex flex-wrap justify-center gap-2">
                {GRADUATION_YEARS.slice(0, 14).map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setForm({ ...form, graduation_year: String(y) })}
                    className={cn('wiz-chip', form.graduation_year === String(y) && 'wiz-chip-selected')}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
            <div className="journey-card text-center">
              <p className="mb-4 text-sm font-bold text-slate-700">GPA or percentage</p>
              <input
                className="wiz-input-hero"
                placeholder="e.g. 8.5 or 85%"
                value={form.gpa}
                onChange={(e) => setForm({ ...form, gpa: e.target.value })}
              />
            </div>
          </motion.div>
        )}
      </StepBody>
    </>
  );
}

export function WorkStep({ form, setForm }) {
  return (
    <>
      <StepHero
        eyebrow="Work experience"
        emoji="💼"
        title="Tell us about your career"
        subtitle="Top MBA programs value the impact you've made in the professional world."
      />
      <StepBody>
        <div className="space-y-3">
          {EXPERIENCE_OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.value}
              type="button"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setForm({ ...form, experience_years: opt.value })}
              className={cn(
                'wiz-option-card flex items-center justify-between',
                form.experience_years === opt.value && 'wiz-option-card-selected'
              )}
            >
              <span className="text-lg font-semibold text-slate-900">{opt.label}</span>
              {form.experience_years === opt.value && <Check className="h-5 w-5 text-slate-900" />}
            </motion.button>
          ))}
        </div>
        {form.experience_years && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 space-y-6">
            <div className="journey-card">
              <p className="mb-4 text-sm font-bold text-slate-700">Industry</p>
              <div className="flex flex-wrap justify-center gap-2">
                {INDUSTRY_OPTIONS.map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setForm({ ...form, industry: ind })}
                    className={cn('wiz-chip', form.industry === ind && 'wiz-chip-selected')}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>
            <div className="journey-card text-center">
              <p className="mb-4 text-sm font-bold text-slate-700">Current role</p>
              <input
                className="wiz-input-hero"
                placeholder="Product Manager, Consultant…"
                value={form.current_role}
                onChange={(e) => setForm({ ...form, current_role: e.target.value })}
              />
            </div>
          </motion.div>
        )}
      </StepBody>
    </>
  );
}

export function CareerGoalsStep({ form, setForm }) {
  return (
    <>
      <StepHero
        eyebrow="Career goals"
        emoji="🎯"
        title="Where do you want to go post-MBA?"
        subtitle="Choose the path that excites you — we'll align schools with your ambitions."
      />
      <StepBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CAREER_GOALS.map((goal, i) => (
            <motion.button
              key={goal.value}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setForm({ ...form, career_goal: goal.value })}
              className={cn('wiz-career-card', form.career_goal === goal.value && 'wiz-career-card-selected')}
            >
              <span className="text-3xl">{goal.icon}</span>
              <span className="font-semibold text-slate-900">{goal.label}</span>
            </motion.button>
          ))}
        </div>
        {form.career_goal === 'Other' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <input
              className="wiz-input-hero"
              placeholder="Describe your dream role"
              value={form.career_goal_other}
              onChange={(e) => setForm({ ...form, career_goal_other: e.target.value })}
            />
          </motion.div>
        )}
      </StepBody>
    </>
  );
}

export function CountriesStep({ form, setForm }) {
  const toggle = (country) => {
    const next = form.target_countries.includes(country)
      ? form.target_countries.filter((c) => c !== country)
      : [...form.target_countries, country];
    setForm({ ...form, target_countries: next });
  };

  return (
    <>
      <StepHero
        eyebrow="Target countries"
        emoji="🌍"
        title="Where do you want to study?"
        subtitle="Select every country you'd consider — we'll surface the best options globally."
      />
      <StepBody>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {COUNTRY_OPTIONS.map((country, i) => {
            const selected = form.target_countries.includes(country);
            return (
              <motion.button
                key={country}
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggle(country)}
                className={cn('wiz-country-tile', selected && 'wiz-country-tile-selected')}
              >
                <span className="text-2xl">{COUNTRY_FLAGS[country] || '🌐'}</span>
                <span className="text-xs font-semibold text-slate-700">{country}</span>
              </motion.button>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm font-semibold text-slate-600">
          {form.target_countries.length === 0
            ? 'Tap countries to build your shortlist'
            : `${form.target_countries.length} ${form.target_countries.length === 1 ? 'country' : 'countries'} selected`}
        </p>
      </StepBody>
    </>
  );
}

export function BudgetStep({ form, setForm }) {
  return (
    <>
      <StepHero
        eyebrow="Investment range"
        emoji="💰"
        title="What's your MBA budget?"
        subtitle="We'll recommend programs that fit your financial plan — no surprises."
      />
      <StepBody>
        <div className="space-y-3">
          {BUDGET_OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.value}
              type="button"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setForm({ ...form, preferred_budget_max: opt.value })}
              className={cn(
                'wiz-option-card flex items-center gap-4',
                form.preferred_budget_max === opt.value && 'wiz-option-card-selected'
              )}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-800">
                {i + 1}
              </span>
              <span className="text-lg font-semibold text-slate-900">{opt.label}</span>
              {form.preferred_budget_max === opt.value && <Check className="ml-auto h-5 w-5 text-slate-900" />}
            </motion.button>
          ))}
        </div>
      </StepBody>
    </>
  );
}

export function ExamStatusStep({ form, setForm }) {
  const exams = [
    { key: 'cat_status', scoreKey: 'cat_percentile', label: 'CAT', emoji: '📋', placeholder: '99' },
    { key: 'gmat_status', scoreKey: 'gmat', label: 'GMAT', emoji: '📝', placeholder: '720' },
    { key: 'gre_status', scoreKey: 'gre', label: 'GRE', emoji: '📖', placeholder: '325' },
  ];

  return (
    <>
      <StepHero
        eyebrow="Exam status"
        emoji="✅"
        title="Standardized test scores"
        subtitle="Share your CAT, GMAT, or GRE status — or skip this step if not applicable."
      />
      <StepBody>
        <div className="space-y-6">
          {exams.map((exam) => (
            <div key={exam.key} className="journey-card">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{exam.emoji}</span>
                <p className="font-display text-lg font-bold text-slate-900">{exam.label}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {EXAM_STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, [exam.key]: opt.value })}
                    className={cn('wiz-chip', form[exam.key] === opt.value && 'wiz-chip-selected')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {form[exam.key] === 'taken' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                  <input
                    className="wiz-input-hero max-w-xs"
                    placeholder={`Score: ${exam.placeholder}`}
                    value={form[exam.scoreKey]}
                    onChange={(e) => setForm({ ...form, [exam.scoreKey]: e.target.value })}
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </StepBody>
    </>
  );
}

export function ProgramInterestsStep({ form, setForm }) {
  const toggle = (interest) => {
    const next = form.target_programs.includes(interest)
      ? form.target_programs.filter((p) => p !== interest)
      : [...form.target_programs, interest];
    setForm({ ...form, target_programs: next });
  };

  return (
    <>
      <StepHero
        eyebrow="Program preferences"
        emoji="🎓"
        title="Which MBA formats interest you?"
        subtitle="Choose all program types you're open to — full-time, executive, online, and more."
      />
      <StepBody>
        <div className="grid gap-4 sm:grid-cols-2">
          {MBA_INTERESTS.map((interest, i) => {
            const selected = form.target_programs.includes(interest);
            return (
              <motion.button
                key={interest}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggle(interest)}
                className={cn(
                  'journey-card flex items-center gap-4 text-left',
                  selected && 'journey-card--selected'
                )}
              >
                <span className="text-3xl">{PROGRAM_EMOJI[interest]}</span>
                <div>
                  <p className="font-display font-bold text-slate-900">{interest}</p>
                  {selected && <p className="text-xs font-semibold text-slate-600">Selected</p>}
                </div>
              </motion.button>
            );
          })}
        </div>
      </StepBody>
    </>
  );
}

export function GeneratingStep({ messageIndex }) {
  const message = GENERATION_MESSAGES[messageIndex % GENERATION_MESSAGES.length];

  return (
    <div className="wiz-generating-bg">
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className="wiz-generating-orb"
      >
        <Sparkles className="h-12 w-12 text-white" />
      </motion.div>
      <Loader2 className="mt-6 h-8 w-8 animate-spin text-white/60" />

      <h2 className="mt-10 font-display text-3xl font-bold tracking-tight md:text-4xl">
        Building your MBA matches
      </h2>
      <p className="mt-2 text-sm font-medium uppercase tracking-widest text-white/50">AI recommendation engine</p>

      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="mt-6 text-lg text-white/80"
        >
          {message}
        </motion.p>
      </AnimatePresence>

      <div className="mt-10 flex gap-2">
        {GENERATION_MESSAGES.map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i <= messageIndex ? 1.15 : 1 }}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i <= messageIndex ? 'w-10 bg-white' : 'w-6 bg-white/25'
            )}
          />
        ))}
      </div>
    </div>
  );
}

function WhyMatches({ factors }) {
  const top = (factors || []).filter((f) => f.detail).slice(0, 3);
  if (!top.length) return null;
  return (
    <div className="wiz-why-box">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Why this matches you</p>
      <ul className="mt-2 space-y-1.5">
        {top.map((f) => (
          <li key={f.key} className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">{f.label}</span> — {f.detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResultsStep({ universities, programs, onFinish, saving }) {
  const unis = (universities || []).slice(0, 5);
  const progs = (programs || []).slice(0, 5);

  return (
    <div className="pb-32">
      <div className="wiz-results-hero">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <span className="text-5xl">🎉</span>
        </motion.div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Your personalized MBA matches
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-600">
          Universities and programs ranked by how well they fit your profile, goals, and budget.
        </p>
      </div>

      <StepBody className="onboarding-content--wide !pb-8">
        <section className="mb-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">Top Universities</h2>
              <p className="mt-1 text-sm text-slate-500">Best-fit business schools for your profile</p>
            </div>
            <TrendingUp className="hidden h-5 w-5 text-slate-400 sm:block" />
          </div>
          <div className="mt-6 space-y-4">
            {unis.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="wiz-match-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                      #{u.ranking || i + 1}
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold text-slate-900">{u.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {u.location || u.country}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {u.match?.label && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                            {u.match.label}
                          </span>
                        )}
                        {u.fees_max != null && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            {formatFees(u.fees_max)} max
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <MatchScoreBadge score={u.match_score} />
                </div>
                <WhyMatches factors={u.match?.factors} />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="font-display text-xl font-bold text-slate-900">Top Programs</h2>
          <p className="mt-1 text-sm text-slate-500">MBA programs aligned with your interests</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {progs.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="wiz-match-card h-full"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{p.university_name}</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <p className="font-display font-bold text-slate-900">{p.program_name}</p>
                  <MatchScoreBadge score={p.match_score} />
                </div>
                {(p.duration || p.format) && (
                  <p className="mt-1 text-xs text-slate-500">
                    {[p.format, p.duration].filter(Boolean).join(' · ')}
                  </p>
                )}
                <WhyMatches factors={p.match?.factors} />
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-slate-900">Next Steps</h2>
          <p className="mt-1 text-sm text-slate-500">Your path from discovery to admission</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {NEXT_STEPS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="wiz-next-step-card"
              >
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="mt-14 flex justify-center">
          <Button
            size="lg"
            className="h-14 rounded-2xl bg-slate-900 px-12 text-base hover:bg-slate-800"
            onClick={onFinish}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </StepBody>
    </div>
  );
}

export function OnboardingNav({ onBack, onContinue, onSkip, continueDisabled, saving, showSkip }) {
  return (
    <div className="mx-auto flex max-w-lg items-center gap-3">
      {onBack ? (
        <Button type="button" variant="ghost" className="shrink-0" onClick={onBack} disabled={saving}>
          Back
        </Button>
      ) : (
        <div className="w-16" />
      )}
      <div className="flex flex-1 gap-2">
        {showSkip && (
          <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onSkip} disabled={saving}>
            Skip
          </Button>
        )}
        <Button
          type="button"
          className={cn(
            'h-12 flex-1 rounded-xl bg-slate-900 text-base font-semibold hover:bg-slate-800',
            !showSkip && 'w-full'
          )}
          onClick={onContinue}
          disabled={continueDisabled || saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export { validateStep, canSkipStep } from '@/constants/onboarding';
