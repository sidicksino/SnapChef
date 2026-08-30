import { SymbolView } from 'expo-symbols';
import type { TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// How much bottom padding a tab screen's scroll content needs (beyond safe-area
// insets) to clear the floating web tab bar — it overlays content instead of
// reserving layout space, so screens must account for it themselves. Sized
// generously above the pill's actual ~72px rendered height.
export const TAB_BAR_CLEARANCE = 110;

type IconName = 'home' | 'search' | 'saved' | 'profile';

// `android` doubles as the web glyph too — expo-symbols types web's name as
// the same Material Symbols set as android (see expo-symbols/SymbolModule.types).
const ICONS = {
  home: { sf: 'house', sfActive: 'house.fill', android: 'home' },
  search: { sf: 'magnifyingglass', sfActive: 'magnifyingglass', android: 'search' },
  saved: { sf: 'bookmark', sfActive: 'bookmark.fill', android: 'bookmark' },
  profile: {
    sf: 'person.crop.circle',
    sfActive: 'person.crop.circle.fill',
    android: 'account_circle',
  },
} as const satisfies Record<IconName, { sf: string; sfActive: string; android: string }>;

type TabBarIconProps = TabTriggerSlotProps & { icon: IconName; label: string };

// Regular tab button (Home / Search / Saved / Profile) — matches the
// "BOTTOM NAVIGATION" component in the design system.
export const TabBarIcon = forwardRef<View, TabBarIconProps>(({ icon, label, isFocused, ...props }, ref) => {
  const glyphs = ICONS[icon];
  return (
    // expo-router/ui's TabTrigger (asChild) forwards its own base style
    // ({ flexDirection: 'row', justifyContent: 'space-between' }), which
    // silently wins over className on native since we never explicitly set
    // flexDirection ourselves. Force it back to a column explicitly, placed
    // after `{...props}` so it can't be clobbered by the forwarded style.
    <Pressable
      ref={ref}
      {...props}
      className="flex-1 py-2"
      style={(state) => [
        typeof props.style === 'function' ? props.style(state) : props.style,
        { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 },
      ]}>
      <SymbolView
        tintColor={isFocused ? '#22C55E' : '#6B7280'}
        name={{
          ios: isFocused ? glyphs.sfActive : glyphs.sf,
          android: glyphs.android,
          web: glyphs.android,
        }}
        size={24}
      />
      <Text
        className={`font-poppins-medium text-[11px] ${isFocused ? 'text-brand-green' : 'text-gray-400'}`}>
        {label}
      </Text>
    </Pressable>
  );
});
TabBarIcon.displayName = 'TabBarIcon';

// Center "Scan" button — elevated circular FAB that breaks out of the pill,
// per the design system's bottom nav (the big green circle in the middle).
export const ScanTabButton = forwardRef<View, TabTriggerSlotProps>((props, ref) => {
  return (
    <Pressable ref={ref} {...props} className="flex-1 items-center">
      <View className="-top-6 h-16 w-16 items-center justify-center rounded-full bg-brand-green shadow-lg active:opacity-80">
        <SymbolView
          tintColor="#ffffff"
          name={{ ios: 'viewfinder', android: 'photo_camera', web: 'camera' }}
          size={26}
        />
      </View>
    </Pressable>
  );
});
ScanTabButton.displayName = 'ScanTabButton';

export function TabBarContainer({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      className="inset-x-0 bottom-0 items-center"
      style={{
        // 'fixed' keeps this pinned to the *viewport* while the page's own
        // document scrolls. RN has no such concept (there's no separate
        // document/viewport to scroll independently) so `position` here is
        // typed for 'absolute'/'relative' only — but react-native-web passes
        // arbitrary position values straight through to CSS at runtime, and
        // without this the bar was scrolling away with the page content
        // instead of staying docked to the bottom of the screen.
        position: Platform.OS === 'web' ? ('fixed' as 'absolute') : 'absolute',
        paddingBottom: insets.bottom + 8,
      }}>
      <View className="w-[92%] flex-row items-end rounded-[28px] border border-white/10 bg-surface-card px-2 pt-2">
        {children}
      </View>
    </View>
  );
}
