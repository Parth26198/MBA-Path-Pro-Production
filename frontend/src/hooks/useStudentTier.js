import { useAuthStore } from '@/store/authStore';
import { isPremium, canApply, getTierLabel, collegesRemaining } from '@/lib/studentTier';

export function useStudentTier() {
  const profile = useAuthStore((s) => s.profile);
  return {
    profile,
    isPremium: isPremium(profile),
    canApply: canApply(profile),
    tier: profile?.tier || 'free',
    tierLabel: getTierLabel(profile),
    collegesRemaining: collegesRemaining(profile),
    profileCompletion: profile?.profile_completion?.percent ?? 0,
  };
}
