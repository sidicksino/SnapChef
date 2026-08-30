import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';

// Matches the native launch screen pixel-for-pixel (same bg + logo) so the
// handoff from native splash -> this overlay is invisible, then this
// overlay is removed the instant fonts/layout are ready. Deliberately NOT
// a second animated "splash moment" — TikTok/Instagram/YouTube all go
// straight from their native launch screen into content, and Apple's HIG
// explicitly discourages using the launch screen as a branding animation.
export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => setVisible(false));
      }}
      style={styles.splashOverlay}>
      <Image style={styles.image} source={require('@/assets/images/logo-light.png')} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 132,
    height: 115,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Brand.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
