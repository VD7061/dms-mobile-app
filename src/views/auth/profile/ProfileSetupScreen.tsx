import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Grid } from '@/constants/theme';
import { Button, TextField } from '@/components/ui';
import { useAuthStore } from '@/store';
import { updateProfile } from '@/services';

export function ProfileSetupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const setStoredFullName = useAuthStore((s) => s.setFullName);
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinue = async () => {
    const nextName = fullName.trim();

    if (!nextName || isSaving) {
      return;
    }

    setErrorMessage('');
    setIsSaving(true);

    try {
      await updateProfile({ name: nextName });
      setStoredFullName(nextName);
      router.replace('/(setup)/loading');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={8}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[Typography.hero, styles.title, { color: colors['on-background'] }]}>
              Welcome!
            </Text>
            <Text
              style={[
                Typography.body,
                styles.subtitle,
                { color: colors['on-surface-variant'] },
              ]}>
              Set up your profile to get started
            </Text>
          </View>

          <TextField
            label="Full name"
            labelIcon={
              <Ionicons name="person-outline" size={14} color={colors.primary} />
            }
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your name"
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
          />

          {errorMessage ? (
            <Text style={[Typography.caption, styles.errorText, { color: colors.error }]}>
              {errorMessage}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <Button
              label="Continue"
              onPress={handleContinue}
              disabled={fullName.trim().length === 0 || isSaving}
              loading={isSaving}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Grid.columns.margin,
    paddingTop: 50,
    paddingBottom: 24,
    gap: 24,
  },
  header: {
    gap: 15,
    paddingTop: 20,
  },
  title: {
    lineHeight: 36,
  },
  subtitle: {
    paddingBottom: 20,
    lineHeight: 20,
  },
  footer: {
    marginTop: 'auto',
  },
  errorText: {
    marginTop: -12,
    lineHeight: 17,
  },
});
