import { DarkTheme, DefaultTheme } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

type NavigationTheme = typeof DarkTheme;

export function useNavigationTheme(): NavigationTheme & { isDark: boolean } {
  const { colors, isDark } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;

  return {
    ...base,
    isDark,
    colors: {
      ...base.colors,
      primary: colors['primary'],
      background: colors['background'],
      card: colors['surface'],
      text: colors['on-background'],
      border: colors['outline'],
      notification: colors['error'],
    },
  };
}
