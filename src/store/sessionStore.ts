import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { canRole, type PermissionKey } from '@/permissions/permissions';

export type AuthStep = 'phone' | 'otp' | 'profile';
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export type ShowroomRole = {
  showroom_id: number;
  showroom_name: string;
  role: string;
};

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  requiredName?: boolean;
};

type UserProfile = {
  name: string | null;
  phoneNumber: string | null;
  showroomRoles: ShowroomRole[];
};

type OtpChallenge = {
  countryCode: string;
  phoneNumber: string;
  requestId: string;
};

type SessionState = {
  hasHydrated: boolean;
  hasSeenOnboarding: boolean;
  authStep: AuthStep;
  authStatus: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string;
  expiresAt: number | null;
  requiredName: boolean;
  countryCode: string;
  phoneNumber: string;
  requestId: string | null;
  name: string | null;
  profilePhoneNumber: string | null;
  showroomRoles: ShowroomRole[];
  activeShowroomId: number | null;
  deviceId: string;
  setHasHydrated: (hasHydrated: boolean) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setAuthStep: (step: AuthStep) => void;
  setAuthStatus: (status: AuthStatus) => void;
  setOtpChallenge: (challenge: OtpChallenge) => void;
  setTokens: (tokens: SessionTokens) => void;
  setProfile: (profile: UserProfile) => void;
  setActiveShowroom: (showroomId: number) => void;
  upsertShowroomRole: (showroomRole: ShowroomRole) => void;
  updateProfileName: (name: string) => void;
  clearOtpChallenge: () => void;
  logoutLocal: () => void;
  can: (permission: PermissionKey) => boolean;
};

function createDeviceId() {
  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDefaultActiveShowroomId(showroomRoles: ShowroomRole[]) {
  return showroomRoles[0]?.showroom_id ?? null;
}

function getActiveRole(state: Pick<SessionState, 'activeShowroomId' | 'showroomRoles'>) {
  return (
    state.showroomRoles.find((item) => item.showroom_id === state.activeShowroomId)?.role ?? null
  );
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      hasSeenOnboarding: false,
      authStep: 'phone',
      authStatus: 'unauthenticated',
      accessToken: null,
      refreshToken: null,
      tokenType: 'Bearer',
      expiresAt: null,
      requiredName: false,
      countryCode: '+91',
      phoneNumber: '',
      requestId: null,
      name: null,
      profilePhoneNumber: null,
      showroomRoles: [],
      activeShowroomId: null,
      deviceId: createDeviceId(),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
      setAuthStep: (authStep) => set({ authStep }),
      setAuthStatus: (authStatus) => set({ authStatus }),
      setOtpChallenge: ({ countryCode, phoneNumber, requestId }) =>
        set({ authStep: 'otp', countryCode, phoneNumber, requestId }),
      setTokens: ({ accessToken, refreshToken, expiresIn, tokenType, requiredName }) =>
        set({
          accessToken,
          refreshToken,
          tokenType,
          expiresAt: Date.now() + expiresIn * 1000,
          requiredName: Boolean(requiredName),
          authStatus: 'authenticated',
          authStep: requiredName ? 'profile' : 'phone',
        }),
      setProfile: ({ name, phoneNumber, showroomRoles }) =>
        set((state) => ({
          name,
          profilePhoneNumber: phoneNumber,
          showroomRoles,
          activeShowroomId:
            state.activeShowroomId &&
            showroomRoles.some((item) => item.showroom_id === state.activeShowroomId)
              ? state.activeShowroomId
              : getDefaultActiveShowroomId(showroomRoles),
          requiredName: !name,
        })),
      setActiveShowroom: (activeShowroomId) => set({ activeShowroomId }),
      upsertShowroomRole: (showroomRole) =>
        set((state) => {
          const showroomRoles = [
            ...state.showroomRoles.filter(
              (item) => item.showroom_id !== showroomRole.showroom_id
            ),
            showroomRole,
          ];

          return {
            showroomRoles,
            activeShowroomId: showroomRole.showroom_id,
          };
        }),
      updateProfileName: (name) => set({ name, requiredName: false, authStep: 'phone' }),
      clearOtpChallenge: () => set({ requestId: null, authStep: 'phone' }),
      logoutLocal: () =>
        set({
          authStep: 'phone',
          authStatus: 'unauthenticated',
          accessToken: null,
          refreshToken: null,
          tokenType: 'Bearer',
          expiresAt: null,
          requiredName: false,
          phoneNumber: '',
          requestId: null,
          name: null,
          profilePhoneNumber: null,
          showroomRoles: [],
          activeShowroomId: null,
        }),
      can: (permission) => canRole(getActiveRole(get()), permission),
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasSeenOnboarding: state.hasSeenOnboarding,
        authStep: state.authStep,
        authStatus: state.authStatus,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenType: state.tokenType,
        expiresAt: state.expiresAt,
        requiredName: state.requiredName,
        countryCode: state.countryCode,
        phoneNumber: state.phoneNumber,
        requestId: state.requestId,
        name: state.name,
        profilePhoneNumber: state.profilePhoneNumber,
        showroomRoles: state.showroomRoles,
        activeShowroomId: state.activeShowroomId,
        deviceId: state.deviceId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function selectIsAuthenticated(state: SessionState) {
  return Boolean(state.accessToken && state.authStatus === 'authenticated');
}

export function selectActiveShowroom(state: SessionState) {
  return state.showroomRoles.find((item) => item.showroom_id === state.activeShowroomId) ?? null;
}

export function selectActiveRole(state: SessionState) {
  return getActiveRole(state);
}
