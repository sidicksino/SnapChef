import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { EmptyState } from '@/components/empty-state';
import { getApiErrorMessage } from '@/lib/api-client';
import { getDifficulty } from '@/lib/recipe-presentation';
import { getIngredientIconFuzzy } from '@/constants/ingredient-icons';
import { recipesApi, resolveRecipeImageUrl, type RecipeOut } from '@/lib/api';
import { ScreenBackground } from '@/components/screen-background';

// A saved recipe's detail view — reached by tapping any RecipeCard (Home's
// featured/grid cards, Saved's masonry grid). Fetches fresh by id (GET
// /api/recipes/{id}) rather than the caller passing the whole recipe
// through navigation params — the tapped card already has the data, but a
// param-only approach can't refresh, doesn't work if a route is ever
// deep-linked to directly, and would mean every card owns a second,
// param-shaped copy of the RecipeOut contract to keep in sync. Visually
// mirrors generate-manual.tsx's result view (hero image, icon-based
// ingredients, numbered steps) — same recipe, same presentation either way
// it was reached.
export default function RecipeDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<RecipeOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await recipesApi.get(Number(id));
      setRecipe(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't load this recipe."));
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const imageUri = resolveRecipeImageUrl(recipe?.image_url);

  return (
    <ScreenBackground>
      <StatusBar style="light" />

      {!recipe && (
        <View className="flex-row items-center justify-between px-6" style={{ paddingTop: insets.top + 12 }}>
          <Text className="font-poppins-bold text-2xl text-white">Recipe</Text>
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated active:opacity-70">
            <SymbolView tintColor="#ffffff" name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} />
          </Pressable>
        </View>
      )}

      {!recipe && !error && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#22C55E" />
        </View>
      )}

      {error && (
        <View className="flex-1 justify-center px-6">
          <EmptyState title="Couldn't load this recipe" subtitle={error} actionLabel="Try Again" onAction={load} />
        </View>
      )}

      {recipe && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}
          className="flex-1">
          <View style={{ aspectRatio: 4 / 3 }}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : (
              <LinearGradient
                colors={Brand.gradients.warm}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}>
                <View className="flex-1 items-center justify-center">
                  <SymbolView
                    tintColor="rgba(255,255,255,0.6)"
                    name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }}
                    size={40}
                  />
                </View>
              </LinearGradient>
            )}
            <Pressable
              onPress={() => router.back()}
              className="absolute h-10 w-10 items-center justify-center rounded-full bg-black/40 active:opacity-70"
              style={{ left: 20, top: insets.top + 12 }}>
              <SymbolView tintColor="#ffffff" name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} />
            </Pressable>
          </View>

          <View className="px-6 pt-5">
            <Text className="mb-2 font-poppins-bold text-2xl text-white">{recipe.title}</Text>
            <View className="mb-4 flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <SymbolView tintColor="#9CA3AF" name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={14} />
                <Text className="font-poppins-medium text-sm text-gray-400">
                  {recipe.prep_time_minutes + recipe.cook_time_minutes} min
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <SymbolView
                  tintColor="#9CA3AF"
                  name={{ ios: 'flame', android: 'local_fire_department', web: 'local_fire_department' }}
                  size={14}
                />
                <Text className="font-poppins-medium text-sm text-gray-400">
                  {getDifficulty(recipe.prep_time_minutes, recipe.cook_time_minutes)}
                </Text>
              </View>
            </View>
            <Text className="mb-6 font-poppins-regular text-sm text-gray-300">{recipe.description}</Text>

            <Text className="mb-2 font-poppins-semibold text-base text-white">Ingredients</Text>
            <View className="mb-6">
              {recipe.ingredients.map((item, i) => {
                const line = item.amount ? `${item.amount} ${item.name}` : item.name;
                return (
                  <View
                    key={i}
                    className="mb-2 flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface-card px-4 py-3">
                    <Text className="text-xl">{getIngredientIconFuzzy(item.name)}</Text>
                    <Text className="flex-1 font-poppins-regular text-sm text-gray-300">{line}</Text>
                  </View>
                );
              })}
            </View>

            <Text className="mb-2 font-poppins-semibold text-base text-white">Instructions</Text>
            <View className="gap-3">
              {recipe.instructions.map((step, i) => (
                <View key={i} className="flex-row gap-3">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-green">
                    <Text className="font-poppins-bold text-xs text-white">{i + 1}</Text>
                  </View>
                  <Text className="flex-1 font-poppins-regular text-sm text-gray-300">{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </ScreenBackground>
  );
}
