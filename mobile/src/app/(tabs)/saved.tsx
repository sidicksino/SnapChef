import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { getApiErrorMessage } from '@/lib/api-client';
import { getDifficulty, getRecipePresentation } from '@/lib/recipe-presentation';
import { recipesApi, resolveRecipeImageUrl, type RecipeOut } from '@/lib/api';
import { RecipeCard } from '@/components/recipe-card';
import { ScreenBackground } from '@/components/screen-background';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';

// Varied thumbnail heights, cycled per card, for the staggered masonry look
// (Pinterest/App-Store-style) instead of a uniform grid.
const HEIGHTS = [150, 190, 130, 170, 210, 140, 180, 160, 200, 145];

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const [leftColumn, rightColumn] = useMemo(() => {
    const left: RecipeOut[] = [];
    const right: RecipeOut[] = [];
    (recipes ?? []).forEach((recipe, index) => {
      (index % 2 === 0 ? left : right).push(recipe);
    });
    return [left, right];
  }, [recipes]);

  return (
    <ScreenBackground>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + TAB_BAR_CLEARANCE,
        }}
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
        }>
        <Text className="mb-6 font-poppins-bold text-3xl text-white">Saved</Text>

        {recipes === null && !error && <ActivityIndicator color="#22C55E" className="mt-4" />}

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
            title="No saved recipes"
            subtitle="Recipes you save will appear here."
            actionLabel="Browse Recipes"
            onAction={() => router.push('/home')}
          />
        )}

        {recipes && recipes.length > 0 && (
          <View className="flex-row gap-4">
            {[leftColumn, rightColumn].map((column, columnIndex) => (
              <View key={columnIndex} className="flex-1 gap-4">
                {column.map((recipe, i) => {
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
                      imageUrl={resolveRecipeImageUrl(recipe.image_url)}
                      containerStyle={{ width: '100%' }}
                      thumbnailHeight={HEIGHTS[(columnIndex + i * 2) % HEIGHTS.length]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}
