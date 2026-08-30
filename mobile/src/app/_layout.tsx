import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { DarkTheme, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ToastProvider } from '@/contexts/toast-context';

import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Keep the native splash screen up until Poppins is ready (or fails to
  // load) — AnimatedSplashOverlay hides it once RootLayoutNav decides it's
  // also done hydrating auth state.
  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return; // still hydrating the stored token
    const inOnboardingGroup = segments[0] === '(onboarding)';
    if (!user && !inOnboardingGroup) {
      router.replace('/');
    } else if (user && inOnboardingGroup) {
      router.replace('/home');
    }
  }, [user, segments, router]);

  // Keep the splash up while auth is still hydrating too, so a logged-in
  // user never sees a flash of the onboarding screen before being routed
  // straight to /home.
  if (user === undefined) return null;

  return (
    // Always DarkTheme — the app is dark-mode-only by brand design, not
    // adaptive to the system scheme. Also avoids the white-flash-on-tab-switch
    // issue on iOS 26 (NativeTabs derives its background from this theme).
    <ThemeProvider value={DarkTheme}>
      <ToastProvider>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="generate-manual" options={{ presentation: 'modal' }} />
        </Stack>
      </ToastProvider>
    </ThemeProvider>
  );
}
