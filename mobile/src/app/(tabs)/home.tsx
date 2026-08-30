import { SymbolView } from 'expo-symbols';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Extra clearance for the floating web tab bar, which overlays the top of
// the screen instead of reserving layout space (see app-tabs.web.tsx).
const webTopInset = Platform.select({ web: 72, default: 0 });

// Placeholder dashboard. The full magazine-style feed + AR scan screen
// land in the "UI: Home & Scan" task.
export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + webTopInset + 24,
          paddingBottom: insets.bottom + 32,
        }}
        className="flex-1 px-6">
        <Text className="text-sm font-semibold text-gray-400">Welcome back</Text>
        <Text className="mb-8 text-3xl font-extrabold text-white">What&apos;s in your fridge?</Text>

        <TouchableOpacity className="flex-row items-center justify-between rounded-3xl bg-white px-6 py-5 shadow-lg active:opacity-80">
          <View>
            <Text className="text-lg font-bold text-black">Scan Fridge</Text>
            <Text className="text-sm font-medium text-gray-600">
              Point your camera at your ingredients
            </Text>
          </View>
          <SymbolView
            tintColor="#000000"
            name={{ ios: 'camera.fill', android: 'photo_camera', web: 'camera' }}
            size={28}
          />
        </TouchableOpacity>

        <View className="mt-10 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-white">Recent Recipes</Text>
          <Link href="/explore" className="text-sm font-semibold text-gray-400">
            See all
          </Link>
        </View>

        <View className="mt-4 items-center rounded-3xl border border-white/10 bg-white/5 px-6 py-10">
          <Text className="text-center text-base font-medium text-gray-400">
            No saved recipes yet. Scan your fridge to generate your first one!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
