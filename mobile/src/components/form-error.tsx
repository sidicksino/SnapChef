import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// Inline error, shown right where the error happened (e.g. below a
// password field) — how Instagram/Spotify/TikTok surface a failed login,
// not a native OS alert popup. See contexts/toast-context.tsx for the
// toast counterpart used for background/operation errors elsewhere.
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
      <View className="mt-4 flex-row items-start gap-2 rounded-2xl border border-accent-coral/30 bg-accent-coral/10 px-4 py-3">
        <SymbolView
          tintColor="#FB7185"
          name={{
            ios: 'exclamationmark.circle.fill',
            android: 'error',
            web: 'error',
          }}
          size={16}
        />
        <Text className="flex-1 font-poppins-medium text-sm text-white">{message}</Text>
      </View>
    </Animated.View>
  );
}
