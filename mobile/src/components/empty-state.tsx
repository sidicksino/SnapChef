import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { Button } from '@/components/button';

type EmptyStateProps = {
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction?: () => void;
};

// Matches the "EMPTY STATES" pattern in the design system: a soft circular
// icon badge, title + subtitle, and a primary CTA.
export function EmptyState({ title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center rounded-3xl border border-white/10 bg-white/5 px-6 py-10">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-surface-elevated">
        <Image
          source={require('@/assets/images/logo-light.png')}
          style={{ width: 32, height: 28 }}
          contentFit="contain"
        />
      </View>
      <Text className="mb-1 text-center font-poppins-semibold text-lg text-white">{title}</Text>
      <Text className="mb-6 text-center font-poppins-regular text-sm text-gray-400">
        {subtitle}
      </Text>
      <Button title={actionLabel} variant="primary" onPress={onAction} className="w-full" />
    </View>
  );
}
