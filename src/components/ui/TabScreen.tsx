import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/fonts';
import { useTheme } from '@/hooks/useTheme';

type TabScreenProps = {
  title: string;
  subtitle?: string;
};

export function TabScreen({ title, subtitle }: TabScreenProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors['background'] }]}
      edges={['top']}>
      <Text style={[styles.title, { color: colors['on-background'] }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors['on-surface-variant'] }]}>{subtitle}</Text>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 24,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    marginTop: 8,
  },
});
