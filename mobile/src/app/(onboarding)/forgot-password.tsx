import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authApi } from '@/lib/api';
import { AuthTextField } from '@/components/auth-text-field';
import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { getApiErrorMessage } from '@/lib/api-client';
import { useToast } from '@/contexts/toast-context';

const MIN_PASSWORD_LENGTH = 8; // matches backend/schemas.py's ResetPasswordRequest

// Two steps, one screen, since it's fundamentally one flow: request a reset
// (email), then use what it produces (token + new password). Honest about
// a real limitation instead of pretending otherwise: backend/routers/
// auth.py's forgot-password is an explicit `# MOCK EMAIL SENDER` — it
// prints the reset link to the *backend's own terminal*, there's no email
// service configured to actually deliver it. Step 2 tells you to go get it
// from there rather than silently implying an email is on its way.
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToast();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestReset = async () => {
    if (!email.trim() || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setStep('reset');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not request a password reset.'));
    } finally {
      setSubmitting(false);
    }
  };

  const canReset =
    token.trim().length > 0 &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword.length > 0 &&
    !submitting;

  const handleReset = async () => {
    if (!canReset) return;
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords don’t match.');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword(token.trim(), newPassword);
      showToast('Password reset — log in with your new password.');
      router.replace('/login');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reset your password. The link may have expired.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-bg-primary" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />

      <View className="flex-row px-6 pt-2">
        <Pressable
          onPress={() => (step === 'reset' ? setStep('request') : router.back())}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated active:opacity-70">
          <SymbolView
            tintColor="#ffffff"
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_left' }}
            size={18}
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1 px-8 pt-10">
          {step === 'request' ? (
            <>
              <Text className="mb-2 font-poppins-bold text-4xl text-white">Reset password</Text>
              <Text className="mb-10 font-poppins-regular text-base text-gray-400">
                Enter your account email and we&apos;ll generate a reset link for it.
              </Text>

              <AuthTextField
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
              />

              <FormError message={error} />

              <Button
                title="Send Reset Link"
                onPress={handleRequestReset}
                disabled={!email.trim() || submitting}
                loading={submitting}
                className="mt-8"
              />
            </>
          ) : (
            <>
              <Text className="mb-2 font-poppins-bold text-3xl text-white">Check the backend console</Text>
              <Text className="mb-8 font-poppins-regular text-base text-gray-400">
                This project doesn&apos;t have an email service configured yet, so the reset link isn&apos;t
                actually emailed — it&apos;s printed to the backend server&apos;s own terminal output. Find the
                line starting with{' '}
                <Text className="font-poppins-semibold text-gray-300">PASSWORD RESET LINK FOR</Text>, copy the{' '}
                <Text className="font-poppins-semibold text-gray-300">token=</Text> value from it, and paste
                just that token below.
              </Text>

              <View className="gap-5">
                <AuthTextField
                  label="Reset Token"
                  value={token}
                  onChangeText={(text) => {
                    setToken(text);
                    setError(null);
                  }}
                  placeholder="Paste the token from the console…"
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline
                  numberOfLines={3}
                  style={{ minHeight: 88, textAlignVertical: 'top' }}
                />
                <AuthTextField
                  label="New Password"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError(null);
                  }}
                  placeholder="At least 8 characters"
                  secureTextEntry
                  textContentType="newPassword"
                />
                <AuthTextField
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  secureTextEntry
                  textContentType="newPassword"
                />
              </View>

              <FormError message={error} />

              <Button
                title="Reset Password"
                onPress={handleReset}
                disabled={!canReset}
                loading={submitting}
                className="mt-8"
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
