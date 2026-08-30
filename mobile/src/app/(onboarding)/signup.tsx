import { SymbolView } from 'expo-symbols';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthTextField } from '@/components/auth-text-field';
import { Button } from '@/components/button';

// TODO(Integrate API task): swap this mock submit for a real
// POST /api/auth/register call via the Axios client + expo-secure-store.
export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    email.trim().length > 0 &&
    password.length > 0 &&
    password === confirmPassword &&
    !submitting;

  const handleSignup = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    // Placeholder until the backend is wired up.
    setTimeout(() => {
      setSubmitting(false);
      router.replace('/home');
    }, 400);
  };

  return (
    <View className="flex-1 bg-bg-primary" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />

      <View className="flex-row px-6 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated active:opacity-70">
          <SymbolView
            tintColor="#ffffff"
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_left' }}
            size={18}
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1 px-8 pt-10">
          <Text className="mb-2 font-poppins-bold text-4xl text-white">Create account</Text>
          <Text className="mb-10 font-poppins-regular text-base text-gray-400">
            Save recipes and tailor them to your diet.
          </Text>

          <View className="gap-5">
            <AuthTextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <AuthTextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              textContentType="newPassword"
            />
            <AuthTextField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              textContentType="newPassword"
            />
          </View>

          <Button
            title="Create Account"
            variant="primary"
            onPress={handleSignup}
            disabled={!canSubmit}
            loading={submitting}
            className="mt-10"
          />

          <View className="mt-8 flex-row justify-center gap-1">
            <Text className="font-poppins-regular text-base text-gray-400">
              Already have an account?
            </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="font-poppins-semibold text-base text-white">Log in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
