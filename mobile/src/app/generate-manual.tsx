import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { Button } from '@/components/button';
import { getIngredientIconFuzzy } from '@/constants/ingredient-icons';
import { IngredientRow } from '@/components/ingredient-row';
import { useToast } from '@/contexts/toast-context';
import { getApiErrorMessage } from '@/lib/api-client';
import {
  mapGeneratedRecipeToCreatePayload,
  recipesApi,
  resolveRecipeImageUrl,
  type RecipeResponse,
} from '@/lib/api';
import { ScreenBackground } from '@/components/screen-background';

type Ingredient = { name: string; included: boolean };

// Parses the `detected` route param (a JSON string array of ingredient
// names, passed from scan.tsx after on-device detection) back into a plain
// array. Malformed/missing input just yields an empty starting list, same
// as arriving here from "Enter ingredients manually" directly.
function parseDetected(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

// The manual-entry path to the same real POST /api/recipes/generate +
// POST /api/recipes flow the camera will eventually feed — lets the whole
// loop be exercised for real today, on any platform (including web, where
// the camera doesn't exist at all), without waiting on the on-device
// ingredient-detection model.
export default function GenerateManualScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToast();
  const { detected } = useLocalSearchParams<{ detected?: string }>();
  const detectedIngredients = parseDetected(detected);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    detectedIngredients.map((name) => ({ name, included: true }))
  );
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<RecipeResponse | null>(null);

  const includedIngredients = ingredients.filter((i) => i.included);

  const addIngredient = () => {
    const trimmed = draft.trim();
    if (!trimmed || ingredients.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) return;
    setIngredients((prev) => [...prev, { name: trimmed, included: true }]);
    setDraft('');
  };

  const toggleIngredient = (name: string) => {
    setIngredients((prev) => prev.map((i) => (i.name === name ? { ...i, included: !i.included } : i)));
  };

  const handleGenerate = async () => {
    if (includedIngredients.length === 0) return;
    setGenerating(true);
    try {
      const { data } = await recipesApi.generate(includedIngredients.map((i) => i.name));
      setResult(data);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Could not generate a recipe.'));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await recipesApi.save(mapGeneratedRecipeToCreatePayload(result));
      router.replace('/saved');
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Could not save this recipe.'));
    } finally {
      setSaving(false);
    }
  };

  const imageUri = resolveRecipeImageUrl(result?.image_url);

  return (
    <ScreenBackground>
      <StatusBar style="light" />
      {!result && (
        <View className="flex-row items-center justify-between px-6" style={{ paddingTop: insets.top + 12 }}>
          <Text className="font-poppins-bold text-2xl text-white">What&apos;s in your kitchen?</Text>
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated active:opacity-70">
            <SymbolView tintColor="#ffffff" name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} />
          </Pressable>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
          showsVerticalScrollIndicator={false}>
          {result ? (
            <View>
              {/* Hero image (or a gradient placeholder if generation didn't
                  produce one) — the close button rides on top of it, same
                  spot reference recipe apps put it, instead of a separate
                  header row eating vertical space above the fold. */}
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
                <Text className="mb-2 font-poppins-bold text-2xl text-white">{result.title}</Text>
                <View className="mb-4 flex-row items-center gap-2">
                  <SymbolView tintColor="#9CA3AF" name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={14} />
                  <Text className="font-poppins-medium text-sm text-gray-400">
                    ~{result.estimated_time} min
                  </Text>
                </View>
                <Text className="mb-6 font-poppins-regular text-sm text-gray-300">
                  {result.description}
                </Text>

                <Text className="mb-2 font-poppins-semibold text-base text-white">Ingredients</Text>
                <View className="mb-6">
                  {result.ingredients.map((item, i) => (
                    <View
                      key={i}
                      className="mb-2 flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface-card px-4 py-3">
                      <Text className="text-xl">{getIngredientIconFuzzy(item)}</Text>
                      <Text className="flex-1 font-poppins-regular text-sm text-gray-300">{item}</Text>
                    </View>
                  ))}
                </View>

                <Text className="mb-2 font-poppins-semibold text-base text-white">Instructions</Text>
                <View className="mb-8 gap-3">
                  {result.instructions.map((step, i) => (
                    <View key={i} className="flex-row gap-3">
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-green">
                        <Text className="font-poppins-bold text-xs text-white">{i + 1}</Text>
                      </View>
                      <Text className="flex-1 font-poppins-regular text-sm text-gray-300">{step}</Text>
                    </View>
                  ))}
                </View>

                <Button title="Save to Cookbook" onPress={handleSave} loading={saving} />
                <Button
                  title="Try Again"
                  variant="text"
                  onPress={() => setResult(null)}
                  className="mt-2 self-center"
                />
              </View>
            </View>
          ) : (
            <View className="px-6 pt-6">
              <Text className="mb-6 font-poppins-regular text-base text-gray-300">
                {detectedIngredients.length > 0
                  ? "Here's what we spotted in your photo — edit the list before generating."
                  : "Add the ingredients you have on hand, and we'll generate a recipe from them."}
              </Text>

              <View className="mb-4 flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface-card px-5 py-4">
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  onSubmitEditing={addIngredient}
                  returnKeyType="done"
                  placeholder="Add ingredient…"
                  placeholderTextColor="#6B7280"
                  className="flex-1 font-poppins-regular text-base text-white"
                />
                <Pressable
                  onPress={addIngredient}
                  disabled={!draft.trim()}
                  className="h-8 w-8 items-center justify-center rounded-full bg-brand-green active:opacity-70 disabled:opacity-40">
                  <SymbolView tintColor="#ffffff" name={{ ios: 'plus', android: 'add', web: 'add' }} size={16} />
                </Pressable>
              </View>

              {ingredients.length > 0 && (
                <View className="mb-6">
                  {ingredients.map((ingredient) => (
                    <IngredientRow
                      key={ingredient.name}
                      name={ingredient.name}
                      included={ingredient.included}
                      onToggle={() => toggleIngredient(ingredient.name)}
                    />
                  ))}
                </View>
              )}

              <Button
                title="Generate Recipe"
                onPress={handleGenerate}
                disabled={includedIngredients.length === 0}
                loading={generating}
              />
              {generating && (
                <Text className="mt-3 text-center font-poppins-regular text-xs text-gray-500">
                  Creating your recipe and a photo for it — this can take up to 20 seconds
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}
