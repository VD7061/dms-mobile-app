import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type FormInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: IconName;
  iconColor: string;
  backgroundColor: string;
  borderBottomColor: string;
  labelColor: string;
  inputColor: string;
  placeholderColor: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
  editable?: boolean;
  required?: boolean;
};

export function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  iconColor,
  backgroundColor,
  borderBottomColor,
  labelColor,
  inputColor,
  placeholderColor,
  keyboardType = 'default',
  editable = true,
  required = false,
}: FormInputProps) {
  return (
    <View style={[styles.row, { borderBottomColor }]}>
      <View style={[styles.iconBox, { backgroundColor }]}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <View style={styles.inputBox}>
        <Text style={[styles.label, { color: labelColor }]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <TextInput
          style={[styles.input, { color: inputColor }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          editable={editable}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  inputBox: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  required: {
    color: '#ff0000',
  },
  input: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
});
