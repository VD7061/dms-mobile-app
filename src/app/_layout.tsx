import { useEffect } from 'react';
import { ThemeProvider, Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNavigationTheme } from '@/hooks/useNavigationTheme';
import { getProfile } from '@/services';
import { selectIsAuthenticated, useSessionStore } from '@/store';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const navigationTheme = useNavigationTheme();
  const router = useRouter();
  const segments = useSegments();
  const hasHydrated = useSessionStore((s) => s.hasHydrated);
  const hasSeenOnboarding = useSessionStore((s) => s.hasSeenOnboarding);
  const isAuthenticated = useSessionStore(selectIsAuthenticated);
  const profilePhoneNumber = useSessionStore((s) => s.profilePhoneNumber);
  const requiredName = useSessionStore((s) => s.requiredName);
  const setProfile = useSessionStore((s) => s.setProfile);
  const hasShowroomRoles = useSessionStore((s) => s.showroomRoles.length > 0);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const routeSegments = segments as string[];
    const inAuthGroup = routeSegments[0] === '(auth)';
    const inSetupGroup = routeSegments[0] === '(setup)';
    const authScreen = routeSegments[1];
    const inOnboardingScreen = inAuthGroup && (authScreen === undefined || authScreen === 'index');
    const inLoginScreen = inAuthGroup && authScreen === 'login';

    if (!hasSeenOnboarding) {
      if (!inOnboardingScreen) {
        router.replace('/(auth)');
      }
      return;
    }

    if (!isAuthenticated) {
      if (!inLoginScreen) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (requiredName) {
      if (!inLoginScreen) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (!hasShowroomRoles) {
      if (!inSetupGroup) {
        router.replace('/(setup)');
      }
      return;
    }

    if (inAuthGroup) {
      router.replace('/(app)');
    }
  }, [
    hasHydrated,
    hasSeenOnboarding,
    hasShowroomRoles,
    isAuthenticated,
    requiredName,
    segments,
    router,
  ]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || requiredName || profilePhoneNumber) {
      return;
    }

    getProfile()
      .then((response) => {
        setProfile({
          name: response.data.name,
          phoneNumber: response.data.phone_number,
          showroomRoles: response.data.showroom_roles,
        });
      })
      .catch(() => {
        // The API client handles token refresh/logout. Keep navigation stable here.
      });
  }, [hasHydrated, isAuthenticated, profilePhoneNumber, requiredName, setProfile]);

  if (!hasHydrated) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: navigationTheme.colors.background },
      }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(setup)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="vehicle/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  const navigationTheme = useNavigationTheme();

  const [loaded, error] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={navigationTheme.isDark ? 'light' : 'dark'} />
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
