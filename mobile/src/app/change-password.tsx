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
import { ScreenBackground } from '@/components/screen-background';
import { useToast } from '@/contexts/toast-context';

const MIN_PASSWORD_LENGTH = 8; // matches backend/schemas.py's ChangePasswordRequest

// A real change-password flow (unlike forgot/reset — see that screen's
// comment — this one needs no email delivery, it's fully functional as-is)
// reached from Profile's "Change Password" row. Root-level modal screen,
// same pattern as generate-manual.tsx.
export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword.length > 0 &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords don’t match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      showToast('Password changed.');
      router.back();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not change your password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenBackground>
      <StatusBar style="light" />
      <View
        className="flex-row items-center justify-between px-6"
        style={{ paddingTop: insets.top + 12 }}>
        <Text className="font-poppins-bold text-2xl text-white">Change Password</Text>
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated active:opacity-70">
          <SymbolView tintColor="#ffffff" name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1 px-6 pt-6">
          <View className="gap-5">
            <AuthTextField
              label="Current Password"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                setError(null);
              }}
              placeholder="••••••••"
              secureTextEntry
              textContentType="password"
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
            title="Change Password"
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={submitting}
            className="mt-8"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}
