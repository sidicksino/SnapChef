import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';

type PhotoReviewProps = {
  uri: string;
  onRetake: () => void;
  onUsePhoto: () => void;
  detecting?: boolean;
};

// Shown after a photo is captured OR picked from the library — same review
// step either way, since ingredient detection works off a plain image
// regardless of where it came from.
export function PhotoReview({ uri, onRetake, onUsePhoto, detecting }: PhotoReviewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg-primary">
      <StatusBar style="light" />
      <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" />
      <View
        className="absolute inset-x-0 bottom-0 flex-row gap-4 px-8"
        style={{ paddingBottom: insets.bottom + 140 }}>
        <Button
          title="Retake"
          variant="secondary"
          onPress={onRetake}
          disabled={detecting}
          className="flex-1"
        />
        <Button
          title="Use Photo"
          variant="primary"
          onPress={onUsePhoto}
          loading={detecting}
          className="flex-1"
        />
      </View>
    </View>
  );
}
