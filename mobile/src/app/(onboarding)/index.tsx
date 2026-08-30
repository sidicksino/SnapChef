import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Background Image with Gradient Overlay */}
      <View className="absolute inset-0">
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1490818387583-1baba5e638cb?q=80&w=3132&auto=format&fit=crop',
          }}
          className="h-3/4 w-full opacity-50"
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
          className="absolute inset-0"
        />
      </View>

      {/* Content */}
      <View className="flex-1 justify-end px-8 pb-16">
        <Text className="mb-4 text-6xl font-extrabold tracking-tight text-white">
          {'Snap.\nCook.\nEat.'}
        </Text>
        <Text className="mb-10 text-lg font-medium leading-relaxed text-gray-400">
          Turn the ingredients in your fridge into world-class recipes using AI vision.
        </Text>

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => router.push('/login')}
          className="flex-row items-center justify-center rounded-full bg-white py-4 shadow-lg active:opacity-80">
          <Text className="text-xl font-bold text-black">Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
