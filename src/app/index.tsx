import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useSession } from '@/hooks/useSession';

export default function BootScreen() {
  const { colors } = useTheme();
  const { isLoading, hasTokens } = useSession();

  if (isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={hasTokens ? '/(setup)/loading' : '/(auth)'} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
