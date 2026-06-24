import { useEffect, useState, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { authApi, studentApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import {
  AcademicStep,
  BudgetStep,
  CareerGoalsStep,
  CountriesStep,
  ExamStatusStep,
  GeneratingStep,
  OnboardingNav,
  ProgramInterestsStep,
  ResultsStep,
  WelcomeStep,
  WorkStep,
  validateStep,
  canSkipStep,
} from '@/components/onboarding/OnboardingSteps';
import {
  buildProfilePayload,
  defaultOnboardingForm,
  hydrateOnboardingForm,
  normalizeOnboardingStep,
  TOTAL_ONBOARDING_STEPS,
} from '@/constants/onboarding';
import { DEMO_PROGRAMS, DEMO_UNIVERSITIES } from '@/constants/onboardingDemoData';
import { Button } from '@/components/ui/button';

const PROFILE_STEPS = 8;
const GENERATION_STEP = 9;
const RESULTS_STEP = 10;

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const { token, user, profile, setAuth, updateProfile } = useAuthStore();
  const [step, setStep] = useState(() => normalizeOnboardingStep(profile?.onboarding_step));
  const [form, setForm] = useState(defaultOnboardingForm());
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const safeStep = normalizeOnboardingStep(step);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-profile-onboarding'],
    queryFn: studentApi.profile,
    enabled: !!token,
    retry: 1,
  });

  useEffect(() => {
    if (!data?.data || hydrated) return;
    const p = data.data;
    if (p.onboarding_completed) {
      if (profile?.onboarding_completed !== true) {
        updateProfile(p);
      }
      setHydrated(true);
      return;
    }
    const resumeStep = normalizeOnboardingStep(p.onboarding_step);
    if (resumeStep >= RESULTS_STEP) {
      setStep(RESULTS_STEP);
    } else if (resumeStep === GENERATION_STEP) {
      setStep(GENERATION_STEP);
    } else {
      setStep(resumeStep);
    }
    setForm(hydrateOnboardingForm(p));
    setHydrated(true);
  }, [data, hydrated, profile?.onboarding_completed, updateProfile]);

  useEffect(() => {
    if (!token || hydrated || isLoading || data?.data) return;
    const timer = setTimeout(() => setHydrated(true), 2500);
    return () => clearTimeout(timer);
  }, [token, hydrated, isLoading, data]);

  const runGeneration = useCallback(async () => {
    setGenerating(true);
    setMessageIndex(0);
    const msgInterval = setInterval(() => setMessageIndex((i) => i + 1), 1200);
    const minDelay = new Promise((r) => setTimeout(r, 4500));

    try {
      const [uniRes, progRes] = await Promise.all([
        studentApi.recommendedUniversities().catch(() => ({ data: [] })),
        studentApi.recommendedPrograms().catch(() => ({ data: [] })),
        minDelay,
      ]);
      const uniData = uniRes?.data?.length ? uniRes.data : DEMO_UNIVERSITIES;
      const progData = progRes?.data?.length ? progRes.data : DEMO_PROGRAMS;
      setUniversities(uniData);
      setPrograms(progData);
      try {
        const res = await studentApi.updateProfile({ onboarding_step: RESULTS_STEP });
        updateProfile(res.data);
      } catch {
        /* continue to results even if save fails */
      }
      setStep(RESULTS_STEP);
    } finally {
      clearInterval(msgInterval);
      setGenerating(false);
    }
  }, [updateProfile]);

  useEffect(() => {
    if (safeStep === GENERATION_STEP && hydrated && !generating && universities.length === 0) {
      runGeneration();
    }
  }, [safeStep, hydrated, generating, universities.length, runGeneration]);

  const saveStep = useCallback(
    async (nextStep, formOverride) => {
      setSaving(true);
      try {
        const activeForm = formOverride || form;
        const payload =
          safeStep === 1 && !formOverride
            ? { onboarding_step: nextStep }
            : buildProfilePayload(activeForm, nextStep);
        const res = await studentApi.updateProfile(payload);
        updateProfile(res.data);
        try {
          const me = await authApi.me();
          setAuth({ token, user: me.data, profile: me.data.profile });
        } catch {
          /* local step advance still works */
        }
        if (formOverride) setForm(activeForm);
        setStep(normalizeOnboardingStep(nextStep));
      } finally {
        setSaving(false);
      }
    },
    [form, safeStep, setAuth, token, updateProfile]
  );

  const handleContinue = useCallback(async () => {
    if (safeStep === 1) {
      await saveStep(2);
      return;
    }
    if (!validateStep(safeStep, form)) return;
    if (safeStep === PROFILE_STEPS) {
      await saveStep(GENERATION_STEP);
      return;
    }
    if (safeStep < PROFILE_STEPS) {
      await saveStep(safeStep + 1);
    }
  }, [form, safeStep, saveStep]);

  const handleSkip = useCallback(async () => {
    const skippedForm = {
      ...form,
      gmat_status: 'not_taking',
      cat_status: 'not_taking',
      gmat: '',
      cat_percentile: '',
    };
    await saveStep(8, skippedForm);
  }, [form, saveStep]);

  const handleBack = useCallback(() => {
    if (safeStep > 1 && safeStep <= PROFILE_STEPS) {
      setStep(normalizeOnboardingStep(safeStep - 1));
    }
  }, [safeStep]);

  const handleFinish = useCallback(async () => {
    setSaving(true);
    try {
      const res = await studentApi.updateProfile({
        ...buildProfilePayload(form, TOTAL_ONBOARDING_STEPS),
        onboarding_completed: true,
      });
      updateProfile(res.data);
      const me = await authApi.me();
      setAuth({ token, user: me.data, profile: me.data.profile });
      navigate('/student', { replace: true });
    } finally {
      setSaving(false);
    }
  }, [form, navigate, setAuth, token, updateProfile]);

  const renderStep = () => {
    const steps = [
      () => <WelcomeStep userName={user?.name} onContinue={handleContinue} saving={saving} />,
      () => <AcademicStep form={form} setForm={setForm} />,
      () => <WorkStep form={form} setForm={setForm} />,
      () => <CareerGoalsStep form={form} setForm={setForm} />,
      () => <CountriesStep form={form} setForm={setForm} />,
      () => <BudgetStep form={form} setForm={setForm} />,
      () => <ExamStatusStep form={form} setForm={setForm} />,
      () => <ProgramInterestsStep form={form} setForm={setForm} />,
      () => <GeneratingStep messageIndex={messageIndex} />,
      () => (
        <ResultsStep
          universities={universities.length ? universities : DEMO_UNIVERSITIES}
          programs={programs.length ? programs : DEMO_PROGRAMS}
          onFinish={handleFinish}
          saving={saving}
        />
      ),
    ];

    const stepIndex = safeStep - 1;
    return steps[stepIndex]?.() ?? (
      <WelcomeStep userName={user?.name} onContinue={handleContinue} saving={saving} />
    );
  };

  if (!token) return <Navigate to="/login" replace />;
  if (profile?.onboarding_completed === true) {
    return <Navigate to="/student" replace />;
  }

  const showFooter = safeStep > 1 && safeStep <= PROFILE_STEPS;

  return (
    <OnboardingShell
      currentStep={safeStep}
      stepKey={safeStep}
      footer={
        showFooter ? (
          <OnboardingNav
            onBack={safeStep > 1 ? handleBack : null}
            onContinue={handleContinue}
            onSkip={handleSkip}
            showSkip={canSkipStep(safeStep)}
            continueDisabled={!validateStep(safeStep, form)}
            saving={saving}
          />
        ) : null
      }
    >
      {isLoading && !hydrated && (
        <div className="journey-sync-banner">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Syncing your profile…
        </div>
      )}

      {isError && (
        <div className="journey-error-banner">
          <span>{error?.message || 'Could not load profile. You can still continue.'}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {renderStep()}
    </OnboardingShell>
  );
}
