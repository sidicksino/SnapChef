import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      {/* Background Image with Gradient Overlay */}
      <View className="absolute inset-0">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1490818387583-1baba5e638cb?q=80&w=3132&auto=format&fit=crop' }} 
          className="w-full h-3/4 opacity-50"
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
          className="absolute inset-0"
        />
      </View>

      {/* Content */}
      <View className="flex-1 justify-end px-8 pb-16">
        <Text className="text-white text-6xl font-extrabold tracking-tight mb-4">
          Snap.<br/>Cook.<br/>Eat.
        </Text>
        <Text className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
          Turn the ingredients in your fridge into world-class recipes using AI vision.
        </Text>

        {/* Action Button */}
        <TouchableOpacity 
          onPress={() => router.push('/login')}
          className="bg-white py-4 rounded-full flex-row justify-center items-center shadow-lg active:opacity-80"
        >
          <Text className="text-black font-bold text-xl">Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
