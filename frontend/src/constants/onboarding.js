export const ONBOARDING_STEPS = [
  { id: 1, key: 'welcome', title: 'Welcome' },
  { id: 2, key: 'academic', title: 'Academic Background' },
  { id: 3, key: 'work', title: 'Work Experience' },
  { id: 4, key: 'career', title: 'Career Goals' },
  { id: 5, key: 'countries', title: 'Target Countries' },
  { id: 6, key: 'budget', title: 'Budget' },
  { id: 7, key: 'exams', title: 'Exam Status' },
  { id: 8, key: 'programs', title: 'Program Interests' },
  { id: 9, key: 'generating', title: 'AI Recommendations' },
  { id: 10, key: 'results', title: 'Your Matches' },
];

export const TOTAL_ONBOARDING_STEPS = ONBOARDING_STEPS.length;
export const PROFILE_STEPS = 8;

/** Coerce API / persisted onboarding_step to a valid 1-based step index. */
export function normalizeOnboardingStep(value, fallback = 1) {
  const parsed = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.round(parsed), TOTAL_ONBOARDING_STEPS);
}

export const DEGREE_OPTIONS = [
  'B.Tech / B.E.',
  'B.Com',
  'BBA',
  'BA',
  'B.Sc',
  'MBBS',
  'Other',
];

export const GRADUATION_YEARS = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);

export const EXPERIENCE_OPTIONS = [
  { value: '0', label: 'Fresher (0 years)' },
  { value: '1-2', label: '1–2 years' },
  { value: '3-5', label: '3–5 years' },
  { value: '5-10', label: '5–10 years' },
  { value: '10+', label: '10+ years' },
];

export const INDUSTRY_OPTIONS = [
  'Technology',
  'Consulting',
  'Finance & Banking',
  'Manufacturing',
  'Healthcare',
  'FMCG / Retail',
  'Energy',
  'Other',
];

export const CAREER_GOALS = [
  { value: 'Consulting', label: 'Consulting', icon: '🎯' },
  { value: 'Finance', label: 'Finance', icon: '💰' },
  { value: 'Marketing', label: 'Marketing', icon: '📣' },
  { value: 'Product', label: 'Product', icon: '🚀' },
  { value: 'Analytics', label: 'Analytics', icon: '📊' },
  { value: 'Entrepreneurship', label: 'Entrepreneurship', icon: '💡' },
  { value: 'Other', label: 'Other', icon: '✨' },
];

export const COUNTRY_OPTIONS = [
  'India', 'USA', 'UK', 'Canada', 'Europe', 'Singapore',
];

export const BUDGET_OPTIONS = [
  { label: '₹10L – ₹20L', value: 2000000 },
  { label: '₹20L – ₹30L', value: 3000000 },
  { label: '₹30L – ₹50L', value: 5000000 },
  { label: '₹50L+', value: 8000000 },
];

export const MBA_INTERESTS = [
  'MBA',
  'Executive MBA',
  'PGDM',
  'MiM',
  'Business Analytics',
  'Finance',
  'Marketing',
];

export const EXAM_STATUS_OPTIONS = [
  { value: 'taken', label: 'Already taken' },
  { value: 'planned', label: 'Planning to take' },
  { value: 'not_taking', label: 'Not taking' },
];

export const defaultOnboardingForm = () => ({
  degree: '',
  graduation_year: '',
  gpa: '',
  experience_years: '',
  industry: '',
  current_role: '',
  career_goal: '',
  career_goal_other: '',
  target_countries: [],
  preferred_budget_max: null,
  target_programs: [],
  gmat_status: '',
  cat_status: '',
  gre_status: '',
  gmat: '',
  cat_percentile: '',
  gre: '',
});

export function hydrateOnboardingForm(profile) {
  const academic = profile?.academic_details || {};
  const work = profile?.work_experience || {};
  const career = profile?.career_goal || '';
  const isOther = career && !CAREER_GOALS.some((g) => g.value === career);

  return {
    degree: academic.degree || '',
    graduation_year: academic.graduation_year || '',
    gpa: academic.gpa || academic.percentage || '',
    experience_years: work.years || '',
    industry: work.industry || '',
    current_role: work.current_role || '',
    career_goal: isOther ? 'Other' : career,
    career_goal_other: isOther ? career : '',
    target_countries: profile?.target_countries || [],
    preferred_budget_max: profile?.preferred_budget_max || null,
    target_programs: profile?.target_programs || [],
    gmat_status: academic.gmat_status || '',
    cat_status: academic.cat_status || '',
    gre_status: academic.gre_status || '',
    gmat: academic.gmat || '',
    cat_percentile: academic.cat_percentile || '',
    gre: academic.gre || '',
  };
}

export function buildProfilePayload(form, nextStep) {
  const careerGoal =
    form.career_goal === 'Other' ? form.career_goal_other?.trim() || 'Other' : form.career_goal;

  return {
    academic_details: {
      degree: form.degree,
      graduation_year: form.graduation_year,
      gpa: form.gpa,
      percentage: form.gpa,
      gmat_status: form.gmat_status,
      cat_status: form.cat_status,
      gre_status: form.gre_status,
      gmat: form.gmat ? Number(form.gmat) : null,
      cat_percentile: form.cat_percentile ? Number(form.cat_percentile) : null,
      gre: form.gre ? Number(form.gre) : null,
    },
    work_experience: {
      years: form.experience_years,
      industry: form.industry,
      current_role: form.current_role,
    },
    career_goal: careerGoal || null,
    target_countries: form.target_countries,
    preferred_budget_max: form.preferred_budget_max,
    target_programs: form.target_programs,
    onboarding_step: nextStep,
  };
}

export function validateStep(step, form) {
  switch (step) {
    case 2:
      return !!(form.degree && form.graduation_year && form.gpa);
    case 3:
      return !!(form.experience_years && form.industry && form.current_role?.trim());
    case 4:
      return form.career_goal && (form.career_goal !== 'Other' || form.career_goal_other?.trim());
    case 5:
      return form.target_countries.length > 0;
    case 6:
      return !!form.preferred_budget_max;
    case 7:
      if (!form.gmat_status && !form.cat_status && !form.gre_status) return false;
      if (form.gmat_status === 'taken' && !form.gmat) return false;
      if (form.cat_status === 'taken' && !form.cat_percentile) return false;
      if (form.gre_status === 'taken' && !form.gre) return false;
      return true;
    case 8:
      return form.target_programs.length > 0;
    default:
      return true;
  }
}

export function canSkipStep(step) {
  return step === 7;
}
