import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  fullWidth = true,
  disabled,
  style,
  ...pressableProps
}: ButtonProps) {
  const { colors } = useTheme();

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
      textColor: colors['on-primary'],
      borderColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.secondary,
      textColor: colors['on-secondary'],
      borderColor: colors.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      textColor: colors.primary,
      borderColor: colors.outline,
    },
  }[variant];

  return (
    <Pressable
      {...pressableProps}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
        },
        variant === 'outline' && styles.outline,
        style,
      ]}>
      <Text
        style={[
          Typography.button,
          styles.label,
          { color: variantStyles.textColor },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  outline: {
    borderWidth: 1,
  },
  label: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: '600',
  },
});
