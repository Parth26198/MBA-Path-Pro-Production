export const TOTAL_ONBOARDING_STEPS = 10;

/** Coerce DB onboarding_step to a valid 1-based step index. */
export function normalizeOnboardingStep(value, fallback = 1) {
  const parsed = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.round(parsed), TOTAL_ONBOARDING_STEPS);
}
