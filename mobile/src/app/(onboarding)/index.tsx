import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg-primary">
      <StatusBar style="light" />

      {/* Brand-gradient hero, replacing a hotlinked stock photo that had
          gone dead (404) — the design system is icon/gradient-based
          anyway, no photography, so this stays on-brand and never breaks.
          Centered in its own flex share of the screen (not flush to the
          status bar) so it has real breathing room above it. */}
      <View className="flex-[0.85] items-center justify-center overflow-hidden">
        <LinearGradient
          colors={['#111827', '#0B1220']}
          className="absolute inset-0"
        />
        <View className="h-56 w-56 items-center justify-center rounded-full bg-brand-green/10">
          <View className="h-40 w-40 items-center justify-center rounded-full bg-brand-green/15">
            <Image
              source={require('@/assets/images/logo-light.png')}
              style={{ width: 104, height: 90 }}
              contentFit="contain"
            />
          </View>
        </View>
        <LinearGradient
          colors={['transparent', '#0B1220']}
          className="absolute inset-x-0 bottom-0 h-24"
        />
      </View>

      {/* Content — anchored to the bottom (not centered in the remaining
          space, which left a dead gap under the button on tall screens). */}
      <View className="flex-1 justify-end px-8" style={{ paddingBottom: insets.bottom + 24 }}>
        {/* Explicit fontSize/lineHeight (not text-6xl's default 1.0 leading) —
            Poppins Bold's descenders (the "p" in Snap) need ~1.17x line-height
            or they clip into the line below. */}
        <Text
          className="font-poppins-bold tracking-tight text-white"
          style={{ fontSize: 48, lineHeight: 56, marginBottom: 16 }}>
          {'Snap.\nCook.\nEat.'}
        </Text>
        <Text className="mb-8 font-poppins-regular text-lg leading-relaxed text-gray-400">
          Turn the ingredients in your fridge into world-class recipes using AI vision.
        </Text>

        <Button title="Get Started" variant="primary" onPress={() => router.push('/login')} />
      </View>
    </View>
  );
}
