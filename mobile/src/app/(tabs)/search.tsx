import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { getApiErrorMessage } from '@/lib/api-client';
import { getDifficulty, getRecipePresentation } from '@/lib/recipe-presentation';
import { recipesApi, resolveRecipeImageUrl, type RecipeOut } from '@/lib/api';
import { RecipeCard } from '@/components/recipe-card';
import { ScreenBackground } from '@/components/screen-background';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';

// Same staggered-masonry look as saved.tsx — search results are the same
// recipes, just filtered, so they get the same visual language rather than
// a different layout for no real reason.
const HEIGHTS = [150, 190, 130, 170, 210, 140, 180, 160, 200, 145];

// Real search over your own saved recipes — matches the query against a
// recipe's title or any of its ingredient names (both, since the search
// bar's own placeholder always promised "ingredients or recipes"). There's
// no backend search endpoint (and doesn't need one): the recipe list is a
// personal cookbook, not a public catalog, so client-side filtering over
// the same GET /api/recipes list Home/Saved already fetch is simpler and
// just as fast for the realistic size of one person's saved recipes.
export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState<RecipeOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const results = useMemo(() => {
    if (!recipes) return null;
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return recipes;
    return recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(trimmed) ||
        recipe.ingredients.some((i) => i.name.toLowerCase().includes(trimmed))
    );
  }, [recipes, query]);

  const [leftColumn, rightColumn] = useMemo(() => {
    const left: RecipeOut[] = [];
    const right: RecipeOut[] = [];
    (results ?? []).forEach((recipe, index) => {
      (index % 2 === 0 ? left : right).push(recipe);
    });
    return [left, right];
  }, [results]);

  return (
    <ScreenBackground>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + TAB_BAR_CLEARANCE,
        }}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6">
        <Text className="mb-6 font-poppins-bold text-3xl text-white">Search</Text>

        <View className="mb-6 flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface-card px-5 py-4">
          <SymbolView
            tintColor="#9CA3AF"
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={18}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search ingredients or recipes…"
            placeholderTextColor="#6B7280"
            returnKeyType="search"
            className="flex-1 font-poppins-regular text-base text-white"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <SymbolView
                tintColor="#6B7280"
                name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
                size={18}
              />
            </Pressable>
          )}
        </View>

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
            title="No saved recipes yet"
            subtitle="Scan your fridge or enter ingredients to generate your first recipe — it'll show up here to search."
            actionLabel="Scan Fridge"
            onAction={() => router.push('/scan')}
          />
        )}

        {results && recipes && recipes.length > 0 && results.length === 0 && (
          <EmptyState
            title="No recipes found"
            subtitle={`Nothing matches "${query}" in your saved recipes' titles or ingredients.`}
            actionLabel="Clear Search"
            onAction={() => setQuery('')}
          />
        )}

        {results && results.length > 0 && (
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
                      onPress={() => router.push(`/recipe/${recipe.id}`)}
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
