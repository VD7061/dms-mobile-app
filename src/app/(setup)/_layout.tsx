import { Stack } from 'expo-router';
import { useNavigationTheme } from '@/hooks/useNavigationTheme';

export default function SetupLayout() {
  const navigationTheme = useNavigationTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: navigationTheme.colors.background },
      }}>
      <Stack.Screen name="loading" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="welcome" />
    </Stack>
  );
}
