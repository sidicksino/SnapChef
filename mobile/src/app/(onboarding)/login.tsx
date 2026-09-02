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
import { FormError } from '@/components/form-error';
import { useAuth } from '@/contexts/auth-context';
import { getApiErrorMessage } from '@/lib/api-client';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/home');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Incorrect email or password.'));
    } finally {
      setSubmitting(false);
    }
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
          <Text className="mb-2 font-poppins-bold text-4xl text-white">Welcome back</Text>
          <Text className="mb-10 font-poppins-regular text-base text-gray-400">
            Log in to pick up where your cookbook left off.
          </Text>

          <View className="gap-5">
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
            <AuthTextField
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              placeholder="••••••••"
              secureTextEntry
              textContentType="password"
            />
          </View>

          <TouchableOpacity onPress={() => router.push('/forgot-password')} className="mt-4 self-end">
            <Text className="font-poppins-medium text-sm text-gray-400">Forgot password?</Text>
          </TouchableOpacity>

          <FormError message={error} />

          <Button
            title="Log In"
            variant="primary"
            onPress={handleLogin}
            disabled={!canSubmit}
            loading={submitting}
            className="mt-10"
          />

          <View className="mt-8 flex-row justify-center gap-1">
            <Text className="font-poppins-regular text-base text-gray-400">
              Don&apos;t have an account?
            </Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text className="font-poppins-semibold text-base text-white">Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
