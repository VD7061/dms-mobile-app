import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Grid } from '@/constants/theme';
import { Button, TextField } from '@/components/ui';
import { useAuthStore } from '@/store';

export function ProfileSetupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const completeProfile = useAuthStore((s) => s.completeProfile);
  const [fullName, setFullName] = useState('');

  const handleContinue = () => {
    completeProfile(fullName.trim());
    router.replace('/(app)');
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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

          <View style={styles.footer}>
            <Button
              label="Continue to Dashboard"
              onPress={handleContinue}
              disabled={fullName.trim().length === 0}
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
});
