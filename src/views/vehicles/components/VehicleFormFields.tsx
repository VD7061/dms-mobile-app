import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/ui';
import { FontFamily, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { SelectOption } from '../data';

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

type SelectFieldProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * Same footprint as FormTextInput (height, radius, border) so it drops into
 * the same field grid, but opens a BottomSheet of fixed options instead of
 * the keyboard — for fields the API only accepts an exact enum value for.
 */
export function SelectField({ label, value, options, onChange, placeholder }: SelectFieldProps) {
  const { colors } = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  // Longer lists (e.g. year of manufacture, ~50 entries) need a capped,
  // scrollable sheet instead of an unbounded View that runs off-screen.
  const isLongList = options.length > 6;

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        style={[
          styles.selectField,
          {
            borderColor: colors.outline,
            backgroundColor: colors.background,
          },
        ]}>
        <Text
          style={[
            Typography.body,
            styles.selectFieldText,
            { color: selected ? colors['on-surface'] : colors['on-surface-variant'] },
          ]}
          numberOfLines={1}>
          {selected?.label ?? placeholder ?? 'Select'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors['on-surface-variant']} />
      </Pressable>

      <BottomSheet visible={isOpen} onClose={() => setIsOpen(false)}>
        <Text style={[Typography.title, styles.sheetTitle, { color: colors['on-background'] }]}>
          {label}
        </Text>

        <ScrollView
          style={isLongList ? { maxHeight: screenHeight * 0.5 } : undefined}
          contentContainerStyle={styles.sheetOptions}
          showsVerticalScrollIndicator={isLongList}>
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  setIsOpen(false);
                  onChange(option.value);
                }}
                style={({ pressed }) => [
                  styles.sheetOption,
                  {
                    backgroundColor: isSelected
                      ? colors['surface-container']
                      : colors['surface-container-low'],
                    borderColor: isSelected ? colors.primary : colors['outline-variant'],
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}>
                {option.icon ? (
                  <View style={[styles.sheetOptionIcon, { backgroundColor: colors['surface-container'] }]}>
                    <MaterialCommunityIcons name={option.icon} size={22} color={colors.primary} />
                  </View>
                ) : null}
                <Text
                  style={[
                    Typography.body,
                    styles.sheetOptionLabel,
                    { color: colors['on-surface'] },
                  ]}>
                  {option.label}
                </Text>
                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </BottomSheet>
    </>
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
  selectField: {
    minHeight: 77,
    borderRadius: 20,
    borderWidth: 1.4,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectFieldText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  sheetTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  sheetOptions: {
    gap: 12,
  },
  sheetOption: {
    minHeight: 68,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sheetOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionLabel: {
    flex: 1,
  },
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
