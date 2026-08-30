import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

import { Button } from '@/components/button';
import { ScreenBackground } from '@/components/screen-background';

// react-native-vision-camera is a native-only Nitro module — importing it
// (even indirectly) breaks the whole web bundle, since Expo Router's static
// web output renders the shared (tabs) layout server-side. Keep this file
// free of that import entirely; see scan.tsx for the real native screen.
export default function ScanScreenWeb() {
  const router = useRouter();

  return (
    <ScreenBackground>
      <View className="flex-1 items-center justify-center px-8">
        <StatusBar style="light" />
        <SymbolView
          tintColor="#6B7280"
          name={{ ios: 'camera.fill', android: 'photo_camera', web: 'camera' }}
          size={40}
        />
        <Text className="mb-2 mt-4 text-center font-poppins-semibold text-lg text-white">
          Camera not available on web
        </Text>
        <Text className="mb-6 text-center font-poppins-regular text-sm text-gray-400">
          Open SnapChef on iOS or Android to scan your fridge, or enter ingredients manually here.
        </Text>
        <Button title="Enter Ingredients Manually" onPress={() => router.push('/generate-manual')} />
      </View>
    </ScreenBackground>
  );
}
