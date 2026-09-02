import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { PageHeader } from '@/components/page-header';
import { PhotoReview } from '@/components/photo-review';
import { useToast } from '@/contexts/toast-context';
import { getApiErrorMessage } from '@/lib/api-client';
import { recipesApi } from '@/lib/api';
import { ScreenBackground } from '@/components/screen-background';

// react-native-vision-camera is a native-only Nitro module — importing it
// (even indirectly) breaks the whole web bundle, since Expo Router's static
// web output renders the shared (tabs) layout server-side. Keep this file
// free of that import entirely; see scan.tsx for the real native screen.
// expo-image-picker, unlike vision-camera, genuinely supports web (opens
// a native <input type="file"> picker), so a photo can still be chosen here.
// "Use Photo" sends it to the same Gemini-vision detect-ingredients
// endpoint scan.tsx uses — that's a plain network call with no native
// dependency, so unlike the old on-device model, web gets real detection
// too now, not just a placeholder.
export default function ScanScreenWeb() {
  const router = useRouter();
  const showToast = useToast();
  const { autoPick } = useLocalSearchParams<{ autoPick?: string }>();
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const autoPickHandled = useRef(false);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPickedUri(result.assets[0].uri);
    }
  };

  // Home's "Upload Photo" tile navigates here with ?autoPick=1 so it opens
  // straight into the picker instead of duplicating this flow on Home.
  useEffect(() => {
    if (autoPick === '1' && !autoPickHandled.current) {
      autoPickHandled.current = true;
      handlePickPhoto();
    }
  }, [autoPick]);

  const handleUsePhoto = async () => {
    if (!pickedUri || detecting) return;
    setDetecting(true);
    try {
      const { data } = await recipesApi.detectIngredients(pickedUri);
      if (data.ingredients.length === 0) {
        showToast("Couldn't confidently identify any ingredients — add them below instead.");
      }
      router.push({
        pathname: '/generate-manual',
        params: { detected: JSON.stringify(data.ingredients) },
      });
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Could not analyze this photo.'));
    } finally {
      setDetecting(false);
    }
  };

  if (detecting) {
    return (
      <ScreenBackground>
        <View className="flex-1 items-center justify-center px-8">
          <StatusBar style="light" />
          <ActivityIndicator color="#22C55E" size="large" />
          <Text className="mb-1 mt-6 font-poppins-semibold text-lg text-white">
            Detecting ingredients…
          </Text>
          <Text className="text-center font-poppins-regular text-sm text-gray-400">
            This may take a few seconds
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  if (pickedUri) {
    return (
      <PhotoReview uri={pickedUri} onRetake={() => setPickedUri(null)} onUsePhoto={handleUsePhoto} />
    );
  }

  return (
    <ScreenBackground>
      <StatusBar style="light" />
      <PageHeader title="Scan" />
      <View className="flex-1 items-center justify-center px-8">
        <SymbolView
          tintColor="#6B7280"
          name={{ ios: 'camera.fill', android: 'photo_camera', web: 'camera' }}
          size={40}
        />
        <Text className="mb-2 mt-4 text-center font-poppins-semibold text-lg text-white">
          Camera not available on web
        </Text>
        <Text className="mb-6 text-center font-poppins-regular text-sm text-gray-400">
          Open SnapChef on iOS or Android to scan your fridge, choose a photo, or enter ingredients
          manually here.
        </Text>
        <Button title="Choose a Photo" onPress={handlePickPhoto} className="w-full" />
        <Button
          title="Enter Ingredients Manually"
          variant="text"
          onPress={() => router.push('/generate-manual')}
          className="mt-2"
        />
      </View>
    </ScreenBackground>
  );
}
