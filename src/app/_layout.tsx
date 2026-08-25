import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeProvider, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { enableFreeze } from 'react-native-screens';
import { DevApiErrorReporter } from '@/components/dev/DevApiErrorReporter';
import { AppAlertProvider } from '@/components/ui';
import { useNavigationTheme } from '@/hooks/useNavigationTheme';

// Stop off-screen tabs and stack screens from re-rendering while hidden.
enableFreeze(true);

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const navigationTheme = useNavigationTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: navigationTheme.colors.background },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(setup)" />
      <Stack.Screen name="(app)" />
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
    // Recommended by react-native-gesture-handler for any app using
    // gesture-driven navigation, regardless of which library consumes it.
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider value={navigationTheme}>
            <AppAlertProvider>
              <StatusBar style={navigationTheme.isDark ? 'light' : 'dark'} />
              <RootNavigator />
              <DevApiErrorReporter />
            </AppAlertProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
