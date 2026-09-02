import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { DetectingIngredients } from '@/components/detecting-ingredients';
import { PhotoReview } from '@/components/photo-review';
import { useToast } from '@/contexts/toast-context';
import { getApiErrorMessage } from '@/lib/api-client';
import { recipesApi } from '@/lib/api';
import { ScreenBackground } from '@/components/screen-background';

// The camera preview + capture flow, plus a "choose from library" path —
// the iOS/Android Simulator has no real camera hardware at all, so picking
// an existing photo is the only way to test this flow there (add one to
// the Simulator's own Photos app first). "Use Photo" sends the captured or
// picked image to Gemini's vision-based /api/recipes/detect-ingredients
// (see recipesApi.detectIngredients) and hands the detected ingredients to
// the same manual-entry/generate screen the "Enter ingredients manually"
// link uses, pre-filled and still editable. An on-device YOLO model (see
// project memory: snapchef-ingredient-detection) handled this before —
// replaced after real-device testing showed it only ever confidently found
// one dominant item per busy photo, a training-data ceiling no amount of
// app-side tuning could fix. Gemini handles cluttered real-world scenes far
// better, at the cost of needing a network call instead of running offline.
export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToast();
  const { autoPick } = useLocalSearchParams<{ autoPick?: string }>();
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const photoOutput = usePhotoOutput();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const autoPickHandled = useRef(false);

  useEffect(() => {
    if (!hasPermission && canRequestPermission) {
      requestPermission();
    }
  }, [hasPermission, canRequestPermission, requestPermission]);

  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const file = await photoOutput.capturePhotoToFile({}, {});
      setCapturedUri(`file://${file.filePath}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Capture failed.');
    } finally {
      setCapturing(false);
    }
  };

  const handlePickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Photo library access is needed to pick a picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setCapturedUri(result.assets[0].uri);
    }
  };

  // Home's "Upload Photo" tile navigates here with ?autoPick=1 so it opens
  // straight into the library picker instead of duplicating this whole
  // permission/review/detect flow on the Home screen. Fires once per visit
  // — a ref (not just checking capturedUri) so tapping "Retake" afterwards
  // doesn't re-trigger the picker.
  useEffect(() => {
    if (autoPick === '1' && !autoPickHandled.current) {
      autoPickHandled.current = true;
      handlePickFromLibrary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPick]);

  const handleUsePhoto = async () => {
    if (!capturedUri || detecting) return;
    setDetecting(true);
    try {
      const { data } = await recipesApi.detectIngredients(capturedUri);
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
    return <DetectingIngredients />;
  }

  if (capturedUri) {
    return (
      <PhotoReview uri={capturedUri} onRetake={() => setCapturedUri(null)} onUsePhoto={handleUsePhoto} />
    );
  }

  if (!hasPermission) {
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
            Camera access needed
          </Text>
          <Text className="mb-6 text-center font-poppins-regular text-sm text-gray-400">
            SnapChef needs your camera to detect ingredients in your fridge.
          </Text>
          <Button
            title={canRequestPermission ? 'Allow Camera' : 'Open Settings'}
            onPress={canRequestPermission ? requestPermission : () => Linking.openSettings()}
          />
          <Button
            title="Choose from Library"
            variant="secondary"
            onPress={handlePickFromLibrary}
            className="mt-3 w-full"
          />
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

  if (!device) {
    return (
      <ScreenBackground>
        <View className="flex-1 items-center justify-center px-8">
          <StatusBar style="light" />
          <SymbolView
            tintColor="#6B7280"
            name={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }}
            size={40}
          />
          <Text className="mb-2 mt-4 text-center font-poppins-semibold text-lg text-white">
            No camera on this device
          </Text>
          <Text className="mb-6 text-center font-poppins-regular text-sm text-gray-400">
            The Simulator has no real camera — add a photo to its Photos app first, then choose it
            below.
          </Text>
          <Button title="Choose from Library" onPress={handlePickFromLibrary} className="w-full" />
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

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <Camera style={{ flex: 1 }} device={device} outputs={[photoOutput]} isActive />

      {/* Viewfinder corner brackets, matching the brand scan icon */}
      <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
        <View className="h-72 w-72">
          <View className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-white" />
          <View className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-white" />
          <View className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-white" />
          <View className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-white" />
        </View>
      </View>

      <Pressable
        onPress={() => router.back()}
        className="absolute left-6 h-10 w-10 items-center justify-center rounded-full bg-black/40 active:opacity-70"
        style={{ top: insets.top + 12 }}>
        <SymbolView
          tintColor="#ffffff"
          name={{ ios: 'xmark', android: 'close', web: 'close' }}
          size={18}
        />
      </Pressable>

      <View
        className="absolute inset-x-0 flex-row items-center justify-center gap-8"
        style={{ bottom: insets.bottom + 130 }}>
        {/* Gallery button — same corner Snapchat/Instagram/TikTok put it in,
            beside the shutter rather than buried in a menu. */}
        <Pressable
          onPress={handlePickFromLibrary}
          className="h-12 w-12 items-center justify-center rounded-full bg-black/40 active:opacity-70">
          <SymbolView
            tintColor="#ffffff"
            name={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }}
            size={20}
          />
        </Pressable>
        <Pressable
          onPress={handleCapture}
          disabled={capturing}
          className="h-20 w-20 items-center justify-center rounded-full border-4 border-white/90 active:opacity-70 disabled:opacity-50">
          <View className="h-16 w-16 rounded-full bg-white" />
        </Pressable>
        <View className="w-12" />
      </View>

      <Pressable
        onPress={() => router.push('/generate-manual')}
        className="absolute inset-x-0 items-center active:opacity-70"
        style={{ bottom: insets.bottom + 70 }}>
        <Text className="font-poppins-medium text-sm text-white/80">
          Or enter ingredients manually
        </Text>
      </Pressable>
    </View>
  );
}
