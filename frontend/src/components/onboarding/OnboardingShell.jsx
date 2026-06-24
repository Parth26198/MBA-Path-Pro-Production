import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { ONBOARDING_STEPS, normalizeOnboardingStep } from '@/constants/onboarding';
import '@/styles/onboarding-wizard.css';

export function OnboardingShell({ currentStep, children, footer, stepKey }) {
  const safeStep = normalizeOnboardingStep(currentStep);
  const stepMeta = ONBOARDING_STEPS[safeStep - 1];
  const progress = (safeStep / ONBOARDING_STEPS.length) * 100;
  const isImmersive = safeStep >= 9;
  const profileSteps = 8;

  return (
    <div className={`onboarding-wizard flex min-h-screen flex-col ${isImmersive ? 'onboarding-wizard--immersive' : ''}`}>
      {!isImmersive && (
        <header className="journey-header">
          <div className="journey-header-inner">
            <div className="flex items-center justify-between gap-4">
              <div className="journey-brand">
                <span className="journey-brand-icon">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <span className="journey-brand-text">MBA Path Pro</span>
              </div>
              <span className="journey-counter">
                Step {safeStep} of {ONBOARDING_STEPS.length}
              </span>
            </div>

            <div className="journey-progress-track">
              <motion.div
                className="journey-progress-fill"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
              />
            </div>

            <div className="journey-dots" aria-hidden>
              {ONBOARDING_STEPS.slice(0, profileSteps).map((s) => (
                <span
                  key={s.key}
                  className={`journey-dot ${
                    s.id < safeStep ? 'journey-dot--done' : s.id === safeStep ? 'journey-dot--active' : ''
                  }`}
                />
              ))}
            </div>

            {stepMeta && (
              <p className="journey-step-label mt-2 text-center">{stepMeta.title}</p>
            )}
          </div>
        </header>
      )}

      <main className="flex-1">
        <motion.div
          key={stepKey ?? safeStep}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {footer && <div className="wiz-footer">{footer}</div>}
    </div>
  );
}

export function StepHero({ emoji, eyebrow, title, subtitle }) {
  return (
    <div className="onboarding-hero">
      {eyebrow && <p className="onboarding-hero-eyebrow">{eyebrow}</p>}
      {emoji && <div className="onboarding-hero-emoji" aria-hidden>{emoji}</div>}
      <h1 className="onboarding-hero-title">{title}</h1>
      {subtitle && <p className="onboarding-hero-sub">{subtitle}</p>}
    </div>
  );
}

export function StepBody({ children, className = '' }) {
  return <div className={`onboarding-content ${className}`}>{children}</div>;
}
