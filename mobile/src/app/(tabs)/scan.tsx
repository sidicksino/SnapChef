import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { showAlert } from '@/lib/alert';
import { ScreenBackground } from '@/components/screen-background';

// The camera preview + capture flow only — feeding captures through the
// on-device YOLOv8 ingredient model (react-native-fast-tflite,
// assets/models/best_int8.tflite) is a separate follow-up pass, not
// wired up yet. "Use Photo" below is honest about that instead of faking
// detected ingredients.
export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const photoOutput = usePhotoOutput();
  const [capturedPath, setCapturedPath] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

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
      setCapturedPath(file.filePath);
    } catch (error) {
      showAlert('Capture failed', error instanceof Error ? error.message : String(error));
    } finally {
      setCapturing(false);
    }
  };

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
          <Text className="mb-6 text-center font-poppins-regular text-base text-gray-400">
            No camera device found on this device.
          </Text>
          <Button title="Enter Ingredients Manually" onPress={() => router.push('/generate-manual')} />
        </View>
      </ScreenBackground>
    );
  }

  if (capturedPath) {
    return (
      <View className="flex-1 bg-bg-primary">
        <StatusBar style="light" />
        <Image source={{ uri: `file://${capturedPath}` }} style={{ flex: 1 }} contentFit="cover" />
        <View
          className="absolute inset-x-0 bottom-0 flex-row gap-4 px-8"
          style={{ paddingBottom: insets.bottom + 140 }}>
          <Button
            title="Retake"
            variant="secondary"
            onPress={() => setCapturedPath(null)}
            className="flex-1"
          />
          <Button
            title="Use Photo"
            variant="primary"
            onPress={() =>
              showAlert(
                'Coming soon',
                'Ingredient detection from this photo is not wired up yet.'
              )
            }
            className="flex-1"
          />
        </View>
      </View>
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

      <View className="absolute inset-x-0 items-center gap-4" style={{ bottom: insets.bottom + 130 }}>
        <Pressable
          onPress={handleCapture}
          disabled={capturing}
          className="h-20 w-20 items-center justify-center rounded-full border-4 border-white/90 active:opacity-70 disabled:opacity-50">
          <View className="h-16 w-16 rounded-full bg-white" />
        </Pressable>
        <Pressable onPress={() => router.push('/generate-manual')} className="active:opacity-70">
          <Text className="font-poppins-medium text-sm text-white/80">
            Or enter ingredients manually
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
