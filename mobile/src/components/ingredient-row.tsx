import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { getIngredientIcon } from '@/constants/ingredient-icons';

type IngredientRowProps = {
  name: string;
  included: boolean;
  onToggle: () => void;
};

// A single row in the ingredient-review list: emoji + name + a checkbox
// toggling whether it's included when generating. Unchecking dims the row
// rather than removing it — the item stays visible/reversible, matching how
// a detected-but-wrong guess should be handled (correct it, don't lose the
// context that it was there).
export function IngredientRow({ name, included, onToggle }: IngredientRowProps) {
  return (
    <Pressable
      onPress={onToggle}
      className="mb-2 flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface-card px-4 py-3 active:opacity-70">
      <Text className="text-2xl">{getIngredientIcon(name)}</Text>
      <Text
        className={`flex-1 font-poppins-medium text-base ${included ? 'text-white' : 'text-gray-500'}`}>
        {name}
      </Text>
      {included ? (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-green">
          <SymbolView
            tintColor="#ffffff"
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            size={14}
          />
        </View>
      ) : (
        <View className="h-6 w-6 rounded-full border-2 border-gray-600" />
      )}
    </Pressable>
  );
}
