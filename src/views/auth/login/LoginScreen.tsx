import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Grid } from '@/constants/theme';
import { BackButton, Button, TextField } from '@/components/ui';
import { getProfile, sendOtp, updateProfile, verifyOtp } from '@/services';
import { useSessionStore } from '@/store';
import { OtpSheet } from './OtpSheet';

export function LoginScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const authStep = useSessionStore((s) => s.authStep);
  const countryCode = useSessionStore((s) => s.countryCode);
  const requestId = useSessionStore((s) => s.requestId);
  const savedPhoneNumber = useSessionStore((s) => s.phoneNumber);
  const setAuthStep = useSessionStore((s) => s.setAuthStep);
  const setOtpChallenge = useSessionStore((s) => s.setOtpChallenge);
  const setTokens = useSessionStore((s) => s.setTokens);
  const setProfile = useSessionStore((s) => s.setProfile);
  const updateProfileName = useSessionStore((s) => s.updateProfileName);
  const [phoneNumber, setPhoneNumber] = useState(savedPhoneNumber);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOtpSheet, setShowOtpSheet] = useState(false);

  const syncProfile = async () => {
    const response = await getProfile();

    setProfile({
      name: response.data.name,
      phoneNumber: response.data.phone_number,
      showroomRoles: response.data.showroom_roles,
    });

    return response;
  };

  const handleGetOtp = async () => {
    const digits = phoneNumber.replace(/\D/g, '');

    setError(null);
    setLoading(true);

    try {
      const response = await sendOtp({ countryCode, phoneNumber: digits });
      setOtpChallenge({ countryCode, phoneNumber: digits, requestId: response.data.requestId });
      setShowOtpSheet(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    if (!requestId) {
      setOtpError('Request id missing. Please request OTP again.');
      return;
    }

    setOtpError(null);
    setLoading(true);

    try {
      const response = await verifyOtp({ requestId, otpCode: otp });
      setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
        tokenType: response.data.tokenType,
        requiredName: response.data.required_name,
      });
      setShowOtpSheet(false);

      if (response.data.required_name) {
        setAuthStep('profile');
        return;
      }

      const profile = await syncProfile();

      if (!profile.data.name) {
        setAuthStep('profile');
        return;
      }

      router.replace(profile.data.showroom_roles.length > 0 ? '/(app)' : '/(setup)');
    } catch (requestError) {
      setOtpError(requestError instanceof Error ? requestError.message : 'Unable to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const name = fullName.trim();

    setError(null);
    setLoading(true);

    try {
      await updateProfile({ name });
      updateProfileName(name);
      const profile = await syncProfile();
      router.replace(profile.data.showroom_roles.length > 0 ? '/(app)' : '/(setup)');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update profile');
    } finally {
      setLoading(false);
    }
  };

  const isProfileStep = authStep === 'profile';

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          {!isProfileStep ? <BackButton /> : null}

          <View style={styles.header}>
            <Text style={[Typography.hero, styles.title, { color: colors['on-background'] }]}>
              {isProfileStep ? 'Welcome!' : 'Enter your phone\nnumber'}
            </Text>
            <Text
              style={[
                Typography.body,
                styles.subtitle,
                { color: colors['on-surface-variant'] },
              ]}>
              {isProfileStep
                ? 'Set up your profile to get started'
                : "We'll send a one-time password to verify your number"}
            </Text>
          </View>

          {isProfileStep ? (
            <TextField
              label="Full name"
              labelIcon={<Ionicons name="person-outline" size={14} color={colors.primary} />}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your name"
              autoComplete="name"
              textContentType="name"
              autoCapitalize="words"
            />
          ) : (
            <TextField
              label="Phone number"
              labelIcon={<Ionicons name="call-outline" size={14} color={colors.primary} />}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+91 XXXXX XXXXX"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
            />
          )}

          {error ? (
            <Text style={[Typography.body, styles.error, { color: colors.error }]}>
              {error}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <Button
              label={
                loading
                  ? isProfileStep
                    ? 'Saving...'
                    : 'Sending...'
                  : isProfileStep
                    ? 'Continue to Dashboard'
                    : 'Get OTP'
              }
              onPress={isProfileStep ? handleSaveProfile : handleGetOtp}
              disabled={loading || (isProfileStep ? fullName.trim().length === 0 : phoneNumber.trim().length === 0)}
            />
            {!isProfileStep ? (
              <Text style={[Typography.micro, styles.terms, { color: colors['on-surface-variant'] }]}>
                By continuing you agree to our{' '}
                <Text style={{ color: isDark ? colors['secondary-container'] : colors['primary-container'] }}>
                  Terms of service
                </Text>
              </Text>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>

      <OtpSheet
        visible={showOtpSheet}
        error={otpError}
        loading={loading}
        phoneNumber={phoneNumber}
        onClose={() => setShowOtpSheet(false)}
        onVerify={handleVerifyOtp}
      />
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
    gap: 16,
  },
  terms: {
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: Typography.micro.fontFamily,
  },
  error: {
    lineHeight: 20,
    textAlign: 'center',
  },
});
