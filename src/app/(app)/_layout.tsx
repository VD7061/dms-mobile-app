import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useNavigationTheme } from '@/hooks/useNavigationTheme';
import { useSession } from '@/hooks/useSession';
import { useAuthStore } from '@/store';

export default function AppLayout() {
  const navigationTheme = useNavigationTheme();
  const { isLoading, hasTokens } = useSession();
  const canEnterApp = useAuthStore((s) => s.canEnterApp);

  if (isLoading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: navigationTheme.colors.background }]}>
        <ActivityIndicator size="large" color={navigationTheme.colors.primary} />
      </View>
    );
  }

  if (!hasTokens) {
    return <Redirect href="/(auth)" />;
  }

  if (!canEnterApp) {
    return <Redirect href="/(setup)/loading" />;
  }

  // The tab bar lives one level down so that detail routes push over it with a
  // real stack transition instead of swapping in as hidden tabs.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: navigationTheme.colors.background },
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="vehicle/[id]" />
      <Stack.Screen name="vehicle/add" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
