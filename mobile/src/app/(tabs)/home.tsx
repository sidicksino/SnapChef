import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { EmptyState } from '@/components/empty-state';
import { getApiErrorMessage } from '@/lib/api-client';
import { getDifficulty, getRecipePresentation } from '@/lib/recipe-presentation';
import { recipesApi, resolveRecipeImageUrl, type RecipeOut } from '@/lib/api';
import { RecipeCard } from '@/components/recipe-card';
import { ScreenBackground } from '@/components/screen-background';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';

function RecipeGridCard({
  recipe,
  onPress,
  width,
}: {
  recipe: RecipeOut;
  onPress: () => void;
  width: number;
}) {
  const presentation = getRecipePresentation(recipe.id);
  return (
    <RecipeCard
      title={recipe.title}
      timeMinutes={recipe.prep_time_minutes + recipe.cook_time_minutes}
      difficulty={getDifficulty(recipe.prep_time_minutes, recipe.cook_time_minutes)}
      gradient={presentation.gradient}
      icon={presentation.icon}
      iconAndroid={presentation.iconAndroid}
      imageUrl={resolveRecipeImageUrl(recipe.image_url)}
      onPress={onPress}
      containerStyle={{ width }}
    />
  );
}

const GRID_SIDE_PADDING = 24;
const GRID_CARD_GAP = 16;

// The most recent recipe (recipes[0] — the list is already newest-first)
// gets a big featured card up top; everything else scrolls horizontally in
// pairs (2 rows tall per swipe) rather than one long single-row strip, so
// the section reads as "your latest, then browse the rest" instead of a
// flat list — and fits far more without the page needing to scroll as far.
function RecentRecipes({ recipes, onPressRecipe }: { recipes: RecipeOut[]; onPressRecipe: (id: number) => void }) {
  const { width: screenWidth } = useWindowDimensions();
  const [featured, ...rest] = recipes;
  const pairs: RecipeOut[][] = [];
  for (let i = 0; i < rest.length; i += 2) {
    pairs.push(rest.slice(i, i + 2));
  }
  const featuredPresentation = getRecipePresentation(featured.id);
  // Two columns fill exactly the same left/right edges as the full-width
  // featured card above, instead of a fixed card width that leaves an
  // uneven gap on wider screens — more columns are still reachable by
  // scrolling, each the same width as these first two.
  const gridCardWidth = (screenWidth - GRID_SIDE_PADDING * 2 - GRID_CARD_GAP) / 2;

  return (
    <View>
      <View className="mb-4 px-6">
        <RecipeCard
          title={featured.title}
          timeMinutes={featured.prep_time_minutes + featured.cook_time_minutes}
          difficulty={getDifficulty(featured.prep_time_minutes, featured.cook_time_minutes)}
          gradient={featuredPresentation.gradient}
          icon={featuredPresentation.icon}
          iconAndroid={featuredPresentation.iconAndroid}
          imageUrl={resolveRecipeImageUrl(featured.image_url)}
          onPress={() => onPressRecipe(featured.id)}
          containerStyle={{ width: '100%' }}
          thumbnailHeight={180}
        />
      </View>

      {pairs.length > 0 && (
        <View
          style={{
            gap: GRID_CARD_GAP,
            paddingHorizontal: GRID_SIDE_PADDING,
          }}>
          {pairs.map((pair, i) => (
            <View key={i} className="flex-row gap-4">
              {pair.map((recipe) => (
                <RecipeGridCard
                  key={recipe.id}
                  recipe={recipe}
                  onPress={() => onPressRecipe(recipe.id)}
                  width={gridCardWidth}
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [recipes, setRecipes] = useState<RecipeOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await recipesApi.list();
      setRecipes(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    // Known false positive on async useCallback fns (setState is after an
    // await, not synchronous): https://github.com/facebook/react/issues/34905
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScreenBackground>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + TAB_BAR_CLEARANCE,
        }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
        }>
        <View className="px-6">
          <View className="mb-6 flex-row items-center gap-2">
            <Image
              source={require('@/assets/images/logo-light.png')}
              style={{ height: 36, width: 36 }}
              contentFit="contain"
            />
            <View className="flex-row items-baseline">
              <Text className="font-poppins-bold text-xl text-white">Snap</Text>
              <Text className="font-poppins-bold text-xl text-brand-green">Chef</Text>
            </View>
          </View>

          <Text className="mb-4 font-poppins-bold text-3xl text-white">
            What&apos;s in your fridge?
          </Text>

          <Pressable
            onPress={() => router.push('/scan')}
            className="mb-3 overflow-hidden rounded-3xl shadow-lg active:opacity-80">
            <LinearGradient
              colors={Brand.gradients.fresh}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View className="flex-row items-center gap-4 px-5 py-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <SymbolView
                  tintColor="#ffffff"
                  name={{ ios: 'camera.fill', android: 'photo_camera', web: 'camera' }}
                  size={22}
                />
              </View>
              <View className="flex-1">
                <Text className="font-poppins-semibold text-base text-white">Scan Fridge</Text>
                <Text className="font-poppins-regular text-sm text-white/80">Take a photo</Text>
              </View>
              <SymbolView
                tintColor="rgba(255,255,255,0.7)"
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                size={16}
              />
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push({ pathname: '/scan', params: { autoPick: '1' } })}
            className="mb-3 flex-row items-center gap-4 rounded-3xl border border-white/10 bg-surface-card px-5 py-4 active:opacity-70">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/15">
              <SymbolView
                tintColor="#22C55E"
                name={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }}
                size={22}
              />
            </View>
            <View className="flex-1">
              <Text className="font-poppins-semibold text-base text-white">Upload Photo</Text>
              <Text className="font-poppins-regular text-sm text-gray-400">Choose from gallery</Text>
            </View>
            <SymbolView
              tintColor="#6B7280"
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={16}
            />
          </Pressable>

          <Pressable
            onPress={() => router.push('/generate-manual')}
            className="flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-surface-card py-3 active:opacity-70">
            <SymbolView
              tintColor="#D1D5DB"
              name={{ ios: 'square.and.pencil', android: 'edit', web: 'edit' }}
              size={14}
            />
            <Text className="font-poppins-medium text-sm text-gray-300">
              Or enter ingredients manually
            </Text>
          </Pressable>
        </View>

        <View className="mt-10 px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-poppins-semibold text-lg text-white">Recent Recipes</Text>
            {recipes && recipes.length > 0 && (
              <Pressable onPress={() => router.push('/saved')}>
                <Text className="font-poppins-medium text-sm text-gray-400">See all</Text>
              </Pressable>
            )}
          </View>

          {recipes === null && !error && (
            <ActivityIndicator color="#22C55E" className="mt-4" />
          )}

          {error && (
            <EmptyState
              title="Couldn't load your recipes"
              subtitle={error}
              actionLabel="Try Again"
              onAction={load}
            />
          )}

          {recipes && recipes.length === 0 && !error && (
            <EmptyState
              title="No recipes yet"
              subtitle="Scan your fridge or enter ingredients to generate your first recipe."
              actionLabel="Scan Fridge"
              onAction={() => router.push('/scan')}
            />
          )}
        </View>

        {recipes && recipes.length > 0 && (
          <RecentRecipes
            recipes={recipes.slice(0, 9)}
            onPressRecipe={(id) => router.push(`/recipe/${id}`)}
          />
        )}
      </ScrollView>

      {/* Pinned above the ScrollView (a sibling, not a child, so it never
          scrolls) — a flat fill in the exact color ScreenBackground's own
          gradient already starts with at y:0, so scrolled-up content is
          covered without any visible seam or mismatched tint. Considered
          iOS 26's native scroll-edge-effect API for this instead, but it
          only works reliably inside a native-stack header's own scroll
          chain (still buggy even there per react-native-screens' tracker),
          which doesn't match how the (tabs) group is structured here. */}
      <View
        pointerEvents="none"
        style={[
          { position: Platform.OS === 'web' ? ('fixed' as 'absolute') : 'absolute' },
          { top: 0, left: 0, right: 0, height: insets.top, backgroundColor: Brand.secondary.purple },
        ]}
      />
    </ScreenBackground>
  );
}
