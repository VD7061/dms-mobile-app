import { Text, TextInput, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function FieldLabel({ label }: { label: string }) {
  const { colors } = useTheme();

  return (
    <Text style={[styles.fieldLabel, { color: colors['on-background'] }]}>{label}</Text>
  );
}

export function FormTextInput({
  style,
  ...inputProps
}: React.ComponentProps<typeof TextInput>) {
  const { colors } = useTheme();

  return (
    <TextInput
      {...inputProps}
      placeholderTextColor={colors['on-surface-variant']}
      style={[
        Typography.body,
        styles.formInput,
        {
          color: colors['on-surface'],
          borderColor: colors.outline,
          backgroundColor: colors.background,
        },
        style,
      ]}
    />
  );
}

export function IconTextInput({
  icon,
  style,
  ...inputProps
}: React.ComponentProps<typeof TextInput> & { icon: IconName }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.inputWrap, { borderColor: colors.primary }]}>
      <Ionicons name={icon} size={23} color={colors.primary} />
      <TextInput
        {...inputProps}
        placeholderTextColor={colors['on-surface-variant']}
        style={[
          Typography.body,
          styles.input,
          {
            color: colors['on-surface'],
          },
          style,
        ]}
      />
    </View>
  );
}

export const formFieldStyles = StyleSheet.create({
  formFields: {
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 16,
  },
  fieldColumn: {
    flex: 1,
    gap: 8,
  },
});

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 15,
    lineHeight: 19,
    fontFamily: FontFamily.medium,
  },
  formInput: {
    minHeight: 77,
    borderRadius: 20,
    borderWidth: 1.4,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.body.fontFamily,
  },
  inputWrap: {
    minHeight: 77,
    borderRadius: 20,
    borderWidth: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: 0,
    fontFamily: Typography.body.fontFamily,
  },
});
