import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      profile: null,
      selectedPackage: null,
      setAuth: ({ token, user, profile }) => set({ token, user, profile }),
      updateProfile: (profile) => set({ profile }),
      setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
      logout: () => set({ token: null, user: null, profile: null, selectedPackage: null }),
    }),
    { name: 'mba-auth' }
  )
);

export const getDashboardPath = (role, profile) => {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'TRAINER':
      return '/trainer';
    case 'STUDENT':
      if (profile && profile.onboarding_completed === false) return '/onboarding';
      return '/student';
    default:
      return '/';
  }
};
