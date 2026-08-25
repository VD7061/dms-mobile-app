import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  hasSeenOnboarding: boolean;
  isLoggedIn: boolean;
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  canEnterApp: boolean;
  primaryShowroomId: number | null;
  setHasSeenOnboarding: (seen: boolean) => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setCanEnterApp: (canEnter: boolean) => void;
  setFullName: (name: string) => void;
  setProfileContact: (contact: { countryCode?: string; phoneNumber?: string }) => void;
  setPrimaryShowroomId: (showroomId: number | null) => void;
  completeProfile: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      isLoggedIn: false,
      fullName: '',
      countryCode: '',
      phoneNumber: '',
      canEnterApp: false,
      primaryShowroomId: null,
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
      setIsLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
      setCanEnterApp: (canEnter) => set({ canEnterApp: canEnter }),
      setFullName: (name) => set({ fullName: name }),
      setProfileContact: ({ countryCode, phoneNumber }) =>
        set((state) => ({
          countryCode: countryCode ?? state.countryCode,
          phoneNumber: phoneNumber ?? state.phoneNumber,
        })),
      setPrimaryShowroomId: (showroomId) => set({ primaryShowroomId: showroomId }),
      completeProfile: (name) => set({ fullName: name, isLoggedIn: true }),
      logout: () =>
        set({
          isLoggedIn: false,
          canEnterApp: false,
          fullName: '',
          countryCode: '',
          phoneNumber: '',
          primaryShowroomId: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasSeenOnboarding: state.hasSeenOnboarding,
        isLoggedIn: state.isLoggedIn,
        fullName: state.fullName,
        countryCode: state.countryCode,
        phoneNumber: state.phoneNumber,
        primaryShowroomId: state.primaryShowroomId,
      }),
    }
  )
);
