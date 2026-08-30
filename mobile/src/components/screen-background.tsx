import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';

// The one background treatment every screen uses — a fixed backdrop (not
// part of scrollable content, so it doesn't move or hand off to a flat
// color as you scroll) fading from the brand purple at the top into the
// base navy. Previously each screen had its own flat bg-bg-primary, and
// Profile alone had a purple gradient confined to just its header — which
// made scrolling past the header read as two different backgrounds
// stitched together. This replaces both with one consistent look.
export function ScreenBackground({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1">
      <LinearGradient
        colors={[Brand.secondary.purple, Brand.background.primary]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
