import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { getApiErrorMessage } from '@/lib/api-client';
import { getDifficulty, getRecipePresentation } from '@/lib/recipe-presentation';
import { PageHeader } from '@/components/page-header';
import { recipesApi, resolveRecipeImageUrl, type RecipeOut } from '@/lib/api';
import { ScreenBackground } from '@/components/screen-background';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';

// A row, not a grid card — deliberately simpler than Home/Saved's card
// layout: small square thumbnail, title + meta, chevron. Search results
// read better as a scannable list than a two-column gallery.
function SearchResultRow({ recipe, onPress }: { recipe: RecipeOut; onPress: () => void }) {
  const presentation = getRecipePresentation(recipe.id);
  const imageUri = resolveRecipeImageUrl(recipe.image_url);

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center gap-4 rounded-2xl border border-white/10 bg-surface-card p-3 active:opacity-70">
      <View className="h-16 w-16 overflow-hidden rounded-xl">
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <LinearGradient
            colors={presentation.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}>
            <View className="flex-1 items-center justify-center">
              <SymbolView
                tintColor="rgba(255,255,255,0.6)"
                name={{ ios: presentation.icon, android: presentation.iconAndroid, web: presentation.iconAndroid }}
                size={26}
              />
            </View>
          </LinearGradient>
        )}
      </View>

      <View className="flex-1">
        <Text numberOfLines={1} className="font-poppins-semibold text-base text-white">
          {recipe.title}
        </Text>
        <View className="mt-1 flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <SymbolView tintColor="#9CA3AF" name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={12} />
            <Text className="font-poppins-regular text-xs text-gray-400">
              {recipe.prep_time_minutes + recipe.cook_time_minutes} min
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <SymbolView
              tintColor="#9CA3AF"
              name={{ ios: 'flame', android: 'local_fire_department', web: 'local_fire_department' }}
              size={12}
            />
            <Text className="font-poppins-regular text-xs text-gray-400">
              {getDifficulty(recipe.prep_time_minutes, recipe.cook_time_minutes)}
            </Text>
          </View>
        </View>
      </View>

      <SymbolView tintColor="#6B7280" name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={16} />
    </Pressable>
  );
}

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

  return (
    <ScreenBackground>
      <StatusBar style="light" />
      <PageHeader title="Search" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + TAB_BAR_CLEARANCE,
        }}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6">
        <View className="mb-6 mt-2 flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface-card px-5 py-4">
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

        {results &&
          results.map((recipe) => (
            <SearchResultRow key={recipe.id} recipe={recipe} onPress={() => router.push(`/recipe/${recipe.id}`)} />
          ))}
      </ScrollView>
    </ScreenBackground>
  );
}
