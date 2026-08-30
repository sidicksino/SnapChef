import { SymbolView } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ScreenBackground } from '@/components/screen-background';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';

// Placeholder — real search results land once the backend recipe history
// is wired up ("Integrate API" task). UI-only for now.
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  return (
    <ScreenBackground>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + TAB_BAR_CLEARANCE,
        }}
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
            className="flex-1 font-poppins-regular text-base text-white"
          />
        </View>

        <EmptyState
          title="No recipes found"
          subtitle="Try adjusting your ingredients or preferences."
          actionLabel="Explore Recipes"
        />
      </ScrollView>
    </ScreenBackground>
  );
}
