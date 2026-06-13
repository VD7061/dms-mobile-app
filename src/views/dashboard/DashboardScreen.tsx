import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Grid } from '@/constants/theme';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store';

export function DashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const fullName = useAuthStore((s) => s.fullName);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[Typography.hero, styles.title, { color: colors['on-background'] }]}>
            Dashboard
          </Text>
          {fullName ? (
            <Text
              style={[
                Typography.body,
                styles.subtitle,
                { color: colors['on-surface-variant'] },
              ]}>
              Welcome, {fullName}
            </Text>
          ) : null}
        </View>

        <Button label="Logout" variant="outline" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Grid.columns.margin,
    paddingTop: 50,
    paddingBottom: 24,
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    lineHeight: 36,
  },
  subtitle: {
    lineHeight: 20,
  },
});
