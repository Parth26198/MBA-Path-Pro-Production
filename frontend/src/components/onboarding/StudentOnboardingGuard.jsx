import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function StudentOnboardingGuard() {
  const profile = useAuthStore((s) => s.profile);
  const location = useLocation();

  const needsOnboarding = profile?.onboarding_completed === false;
  const onOnboardingRoute = location.pathname.startsWith('/onboarding');

  if (needsOnboarding && !onOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
