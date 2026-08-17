import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useNavigationTheme } from '@/hooks/useNavigationTheme';
import { useSession } from '@/hooks/useSession';

export default function SetupLayout() {
  const navigationTheme = useNavigationTheme();
  const { isLoading, hasTokens } = useSession();

  if (isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: navigationTheme.colors.background }]}>
        <ActivityIndicator size="large" color={navigationTheme.colors.primary} />
      </View>
    );
  }

  if (!hasTokens) {
    return <Redirect href="/(auth)" />;
  }

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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
