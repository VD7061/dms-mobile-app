import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  hasSeenOnboarding: boolean;
  isLoggedIn: boolean;
  fullName: string;
  setHasSeenOnboarding: (seen: boolean) => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setFullName: (name: string) => void;
  completeProfile: (name: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      isLoggedIn: false,
      fullName: '',
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
      setIsLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
      setFullName: (name) => set({ fullName: name }),
      completeProfile: (name) => set({ fullName: name, isLoggedIn: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
