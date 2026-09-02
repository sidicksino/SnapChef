import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PageHeaderProps = {
  title: string;
};

// The one persistent top bar every main tab shares (Home/Search/Saved, and
// Scan's own pre-camera states) — logo + page name, left-aligned, nothing
// on the right (no notification bell or similar for a feature that doesn't
// exist). Rendered as a sibling *outside* each screen's ScrollView, not
// inside its contentContainerStyle — a real persistent header like
// Snapchat/Instagram/Uber all have, not one that scrolls away with content.
// A normal (non-absolute) layout sibling, so the ScrollView below it simply
// starts after its height — content never scrolls underneath it, so there's
// no separate status-bar-protector overlay needed either. Deliberately no
// background fill of its own: ScreenBackground's gradient already covers
// the whole screen behind this, including this exact spot, so leaving this
// transparent shows it through with no seam, rather than fighting it with
// a second, competing fill color.
export function PageHeader({ title }: PageHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center gap-3 px-6 pb-4"
      style={{ paddingTop: insets.top + 16 }}>
      <Image
        source={require('@/assets/images/logo-light.png')}
        style={{ height: 38, width: 38 }}
        contentFit="contain"
      />
      <Text className="font-poppins-bold text-2xl text-white">{title}</Text>
    </View>
  );
}
