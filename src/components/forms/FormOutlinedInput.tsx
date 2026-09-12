import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type FormOutlinedInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
};

/**
 * A boxed field with the icon inline, as opposed to `FormInput`'s large icon
 * tile and underline. Used where a form reads as a short review step rather
 * than a long data-entry list.
 */
export function FormOutlinedInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: FormOutlinedInputProps) {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors['on-surface-variant'] }]}>{label}</Text>
      <View
        style={[
          styles.field,
          {
            backgroundColor: isDark
              ? colors['surface-container-low']
              : colors['surface-container-lowest'],
            borderColor: isFocused ? colors.primary : colors['outline-variant'],
            borderWidth: isFocused ? 2 : 1,
            // Keeps the box the same height whether or not it is focused, so
            // fields don't nudge the layout as the user tabs through them.
            paddingHorizontal: isFocused ? 13 : 14,
          },
        ]}>
        {icon ? <Ionicons name={icon} size={20} color={colors.primary} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors['on-surface-variant']}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={[styles.input, { color: colors['on-surface'] }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    ...Typography.body,
    fontSize: 13,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    height: 54,
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    fontFamily: FontFamily.regular,
    fontSize: 14,
    includeFontPadding: false,
  },
});
