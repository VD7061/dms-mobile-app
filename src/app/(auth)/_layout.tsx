import { Stack } from 'expo-router';
import { useNavigationTheme } from '@/hooks/useNavigationTheme';

export default function AuthLayout() {
  const navigationTheme = useNavigationTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: navigationTheme.colors.background },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="welcome" />
    </Stack>
  );
}
