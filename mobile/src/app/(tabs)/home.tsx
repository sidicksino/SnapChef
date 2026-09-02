import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { EmptyState } from '@/components/empty-state';
import { getApiErrorMessage } from '@/lib/api-client';
import { getDifficulty, getRecipePresentation } from '@/lib/recipe-presentation';
import { recipesApi, type RecipeOut } from '@/lib/api';
import { RecipeCard } from '@/components/recipe-card';
import { ScreenBackground } from '@/components/screen-background';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';

function RecipeRow({ recipes, onPressRecipe }: { recipes: RecipeOut[]; onPressRecipe: (id: number) => void }) {
  return (
    // Explicit position:'relative' — the fade overlay below is
    // position:'absolute', and on web (unlike native's Yoga-driven default)
    // an absolute child positions against the nearest *explicitly*
    // positioned ancestor, not just any parent View.
    <View style={{ position: 'relative' }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingHorizontal: 24, paddingRight: 40 }}>
        {recipes.map((recipe) => {
          const presentation = getRecipePresentation(recipe.id);
          return (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              timeMinutes={recipe.prep_time_minutes + recipe.cook_time_minutes}
              difficulty={getDifficulty(recipe.prep_time_minutes, recipe.cook_time_minutes)}
              gradient={presentation.gradient}
              icon={presentation.icon}
              iconAndroid={presentation.iconAndroid}
              onPress={() => onPressRecipe(recipe.id)}
            />
          );
        })}
      </ScrollView>
      {/* Fades the trailing edge so the next card being partially visible
          reads as an intentional "there's more" hint, not a broken crop.
          A translucent black (not a flat color match) so it still blends
          correctly now that the page background is a gradient, not flat. */}
      <LinearGradient
        colors={['transparent', 'rgba(11,18,32,0.9)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40 }}
      />
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
        }>
        <View className="px-6">
          <View className="mb-6 flex-row items-baseline">
            <Text className="font-poppins-bold text-2xl text-white">Snap</Text>
            <Text className="font-poppins-bold text-2xl text-brand-green">Chef</Text>
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
          <RecipeRow recipes={recipes.slice(0, 8)} onPressRecipe={() => router.push('/saved')} />
        )}
      </ScrollView>
    </ScreenBackground>
  );
}
