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
      setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
      logout: () => set({ token: null, user: null, profile: null, selectedPackage: null }),
    }),
    { name: 'mba-auth' }
  )
);

export const getDashboardPath = (role) => {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'TRAINER':
      return '/trainer';
    case 'STUDENT':
      return '/student';
    default:
      return '/';
  }
};
