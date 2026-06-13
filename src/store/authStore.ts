import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  hasSeenOnboarding: boolean;
  isLoggedIn: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      isLoggedIn: false,
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
      setIsLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
