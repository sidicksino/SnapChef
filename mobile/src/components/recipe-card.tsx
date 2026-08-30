import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView, type AndroidSymbol } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { SFSymbols7_0 } from 'sf-symbols-typescript';

export type RecipeCardProps = {
  title: string;
  timeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  gradient: readonly [string, string];
  /** SF Symbol name for the large decorative watermark icon on the thumbnail. */
  icon: SFSymbols7_0;
  iconAndroid: AndroidSymbol;
  favorited?: boolean;
  onPress?: () => void;
  /** Omit entirely to hide the favorite button — the backend has no
   * favorite/like concept at all (backend/schemas.py's RecipeOut carries no
   * such field), so real recipes shouldn't show a control that does nothing. */
  onToggleFavorite?: () => void;
  /** Overrides the card's own width — e.g. `{ width: '100%' }` to fill a
   * masonry grid column instead of the default fixed-width row card. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Thumbnail height in px. Default 128 (matches the horizontal feed rows);
   * masonry grids vary this per-card for the staggered look. */
  thumbnailHeight?: number;
};

// Matches the "CARDS" component in the design system, with one deliberate
// swap: the design system's card mockup uses real food photography, but we
// don't have any recipe photo assets yet (and got burned once already
// hotlinking a stock photo that turned out to be a dead link — see
// (onboarding)/index.tsx's history). A gradient + large watermark icon
// stands in until real photos are wired up, rather than gambling on more
// external links.
export function RecipeCard({
  title,
  timeMinutes,
  difficulty,
  gradient,
  icon,
  iconAndroid,
  favorited,
  onPress,
  onToggleFavorite,
  containerStyle,
  thumbnailHeight = 128,
}: RecipeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-80"
      style={[{ width: 176 }, containerStyle]}>
      <View
        className="mb-3 overflow-hidden rounded-2xl"
        style={{ height: thumbnailHeight }}>
        {/* NativeWind's className doesn't reliably position LinearGradient
            on web (it's a native module, not a plain View) — use `style`
            for absolute-fill instead. */}
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute -bottom-3 -right-3 opacity-25" pointerEvents="none">
          <SymbolView
            tintColor="#ffffff"
            name={{ ios: icon, android: iconAndroid, web: iconAndroid }}
            size={80}
          />
        </View>
        {onToggleFavorite && (
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={8}
            className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-black/25 active:opacity-70">
            <SymbolView
              tintColor="#ffffff"
              name={{
                ios: favorited ? 'heart.fill' : 'heart',
                android: favorited ? 'favorite' : 'favorite_border',
                web: favorited ? 'favorite' : 'favorite_border',
              }}
              size={16}
            />
          </Pressable>
        )}
      </View>
      <Text numberOfLines={1} className="mb-1 font-poppins-semibold text-base text-white">
        {title}
      </Text>
      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center gap-1">
          <SymbolView
            tintColor="#9CA3AF"
            name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
            size={12}
          />
          <Text className="font-poppins-regular text-xs text-gray-400">{timeMinutes} min</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <SymbolView
            tintColor="#9CA3AF"
            name={{ ios: 'flame', android: 'local_fire_department', web: 'local_fire_department' }}
            size={12}
          />
          <Text className="font-poppins-regular text-xs text-gray-400">{difficulty}</Text>
        </View>
      </View>
    </Pressable>
  );
}
