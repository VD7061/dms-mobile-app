import { useColorScheme } from 'react-native';
import { Colors, type ColorScheme } from '@/constants/theme';

export function useTheme() {
  const scheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return {
    scheme,
    colors: Colors[scheme],
    isDark: scheme === 'dark',
  };
}
