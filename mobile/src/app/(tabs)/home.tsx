import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';

// Extra clearance for the floating web tab bar, which overlays the top of
// the screen instead of reserving layout space (see app-tabs.web.tsx).
const webTopInset = Platform.select({ web: 72, default: 0 });

// Placeholder dashboard. The full magazine-style feed + AR scan screen
// land in the "UI: Home & Scan" task.
export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg-primary">
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + webTopInset + 24,
          paddingBottom: insets.bottom + 32,
        }}
        className="flex-1 px-6">
        <Text className="font-poppins-medium text-sm text-gray-400">Welcome back</Text>
        <Text className="mb-8 font-poppins-bold text-3xl text-white">
          What&apos;s in your fridge?
        </Text>

        <Pressable className="overflow-hidden rounded-3xl shadow-lg active:opacity-80">
          <LinearGradient
            colors={['#3B82F6', '#22C55E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-row items-center justify-between px-6 py-5">
            <View>
              <Text className="font-poppins-semibold text-lg text-white">Scan Fridge</Text>
              <Text className="font-poppins-regular text-sm text-white/80">
                Point your camera at your ingredients
              </Text>
            </View>
            <SymbolView
              tintColor="#ffffff"
              name={{ ios: 'camera.fill', android: 'photo_camera', web: 'camera' }}
              size={28}
            />
          </LinearGradient>
        </Pressable>

        <View className="mt-10 flex-row items-center justify-between">
          <Text className="font-poppins-semibold text-lg text-white">Recent Recipes</Text>
          <Text className="font-poppins-medium text-sm text-gray-400">See all</Text>
        </View>

        <View className="mt-4">
          <EmptyState
            title="No saved recipes yet"
            subtitle="Scan your fridge to generate your first one!"
            actionLabel="Scan Fridge"
          />
        </View>
      </ScrollView>
    </View>
  );
}
