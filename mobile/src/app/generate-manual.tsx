import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { useToast } from '@/contexts/toast-context';
import { getApiErrorMessage } from '@/lib/api-client';
import { mapGeneratedRecipeToCreatePayload, recipesApi, type RecipeResponse } from '@/lib/api';
import { ScreenBackground } from '@/components/screen-background';

// The manual-entry path to the same real POST /api/recipes/generate +
// POST /api/recipes flow the camera will eventually feed — lets the whole
// loop be exercised for real today, on any platform (including web, where
// the camera doesn't exist at all), without waiting on the on-device
// ingredient-detection model.
export default function GenerateManualScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToast();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<RecipeResponse | null>(null);

  const addIngredient = () => {
    const trimmed = draft.trim();
    if (!trimmed || ingredients.includes(trimmed)) return;
    setIngredients((prev) => [...prev, trimmed]);
    setDraft('');
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients((prev) => prev.filter((i) => i !== ingredient));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    setGenerating(true);
    try {
      const { data } = await recipesApi.generate(ingredients);
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

  return (
    <ScreenBackground>
      <StatusBar style="light" />
      <View className="flex-row items-center justify-between px-6" style={{ paddingTop: insets.top + 12 }}>
        <Text className="font-poppins-bold text-2xl text-white">
          {result ? 'Your Recipe' : "What's in your kitchen?"}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated active:opacity-70">
          <SymbolView tintColor="#ffffff" name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1 px-6 pt-6">
          {result ? (
            <View>
              <Text className="mb-2 font-poppins-bold text-2xl text-white">{result.title}</Text>
              <Text className="mb-4 font-poppins-regular text-sm text-gray-300">
                {result.description}
              </Text>
              <View className="mb-4 flex-row items-center gap-2">
                <SymbolView tintColor="#9CA3AF" name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={14} />
                <Text className="font-poppins-medium text-sm text-gray-400">
                  ~{result.estimated_time} min
                </Text>
              </View>

              <Text className="mb-2 font-poppins-semibold text-base text-white">Ingredients</Text>
              <View className="mb-6 gap-1">
                {result.ingredients.map((item, i) => (
                  <Text key={i} className="font-poppins-regular text-sm text-gray-300">
                    • {item}
                  </Text>
                ))}
              </View>

              <Text className="mb-2 font-poppins-semibold text-base text-white">Instructions</Text>
              <View className="mb-8 gap-3">
                {result.instructions.map((step, i) => (
                  <View key={i} className="flex-row gap-3">
                    <Text className="font-poppins-bold text-sm text-brand-green">{i + 1}.</Text>
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
          ) : (
            <View>
              <Text className="mb-6 font-poppins-regular text-base text-gray-300">
                Add the ingredients you have on hand, and we&apos;ll generate a recipe from them.
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
                <View className="mb-8 flex-row flex-wrap gap-2">
                  {ingredients.map((ingredient) => (
                    <Chip
                      key={ingredient}
                      label={ingredient}
                      selected
                      onPress={() => removeIngredient(ingredient)}
                    />
                  ))}
                </View>
              )}

              <Button
                title="Generate Recipe"
                onPress={handleGenerate}
                disabled={ingredients.length === 0}
                loading={generating}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}
