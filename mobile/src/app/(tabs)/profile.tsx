import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { Chip } from '@/components/chip';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import { getApiErrorMessage } from '@/lib/api-client';
import { recipesApi, usersApi } from '@/lib/api';
import { ScreenBackground } from '@/components/screen-background';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';

// A fixed set to pick from — the backend just stores whatever string array
// is sent (schemas.py's UserProfileUpdate.dietary_preferences), no server-side
// enum, so this list is a mobile-side UX choice, not a backend constraint.
const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'High-Protein',
  'Low-Carb',
  'Gluten-Free',
  'Dairy-Free',
];

const ROWS = [
  { icon: 'gearshape', android: 'settings', label: 'Preferences' },
  { icon: 'bell', android: 'notifications', label: 'Notifications' },
  { icon: 'lock', android: 'lock', label: 'Change Password' },
  { icon: 'questionmark.circle', android: 'help', label: 'Help & Support' },
] as const;

function formatMemberSince(isoDate: string): string {
  const created = new Date(isoDate);
  const days = Math.max(0, Math.floor((Date.now() - created.getTime()) / 86_400_000));
  if (days < 1) return 'Today';
  if (days < 30) return `${days}d`;
  return created.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

// Spotify-style profile: avatar, a stat row, dietary-preference chips (tap
// to toggle — PUT /api/users/me), then a settings list. Real account data
// via GET /api/users/me; "Recipes Cooked"/"Day Streak" from the old mock
// aren't backed by anything the API tracks, so they're gone rather than
// showing fabricated numbers next to genuinely real ones.
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, setUser } = useAuth();
  const showToast = useToast();
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const loadSavedCount = useCallback(async () => {
    try {
      const { data } = await recipesApi.list();
      setSavedCount(data.length);
    } catch {
      // Leave it as "—" — the Saved tab surfaces the real error if the
      // request is actually broken; this stat just degrades quietly.
    }
  }, []);

  useEffect(() => {
    // Known false positive on async useCallback fns (setState is after an
    // await, not synchronous): https://github.com/facebook/react/issues/34905
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSavedCount();
  }, [loadSavedCount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedCount();
    setRefreshing(false);
  };

  const toggleDietaryPreference = async (option: string) => {
    if (!user || savingPrefs) return;
    const current = user.dietary_preferences;
    const next = current.includes(option)
      ? current.filter((p) => p !== option)
      : [...current, option];
    setSavingPrefs(true);
    try {
      const { data } = await usersApi.updateMe(next);
      setUser(data);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Could not update your preferences.'));
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const STATS = [
    {
      value: savedCount === null ? '—' : String(savedCount),
      label: 'Saved Recipes',
      icon: 'bookmark.fill' as const,
      android: 'bookmark' as const,
    },
    {
      value: String(user?.dietary_preferences.length ?? 0),
      label: 'Preferences',
      icon: 'checkmark.seal.fill' as const,
      android: 'verified' as const,
    },
    {
      value: user ? formatMemberSince(user.created_at) : '—',
      label: 'Member Since',
      icon: 'calendar' as const,
      android: 'calendar_month' as const,
    },
  ];

  return (
    <ScreenBackground>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_CLEARANCE }}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
        }>
        <View style={{ paddingTop: insets.top + 16 }} className="items-center pb-8">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full border-4 border-white/15 bg-surface-elevated">
            <SymbolView
              tintColor="#9CA3AF"
              name={{ ios: 'person.fill', android: 'person', web: 'person' }}
              size={40}
            />
          </View>
          <Text className="font-poppins-semibold text-xl text-white">
            {user?.email ?? 'Your Account'}
          </Text>
          <Text className="font-poppins-regular text-sm text-gray-300">
            {user ? 'Signed in' : 'Sign in to sync your preferences'}
          </Text>
        </View>

        <View className="px-6">
          <View className="-mt-4 flex-row gap-3">
            {STATS.map((stat) => (
              <View
                key={stat.label}
                className="flex-1 items-center gap-1 rounded-2xl border border-white/10 bg-surface-card py-4">
                <SymbolView
                  tintColor={Brand.primary.green}
                  name={{ ios: stat.icon, android: stat.android, web: stat.android }}
                  size={16}
                />
                <Text className="font-poppins-bold text-lg text-white">{stat.value}</Text>
                <Text className="text-center font-poppins-regular text-[11px] text-gray-400">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          <Text className="mb-3 mt-8 font-poppins-semibold text-base text-white">
            Dietary Preferences
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {DIETARY_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={user?.dietary_preferences.includes(option)}
                onPress={() => toggleDietaryPreference(option)}
              />
            ))}
          </View>

          <View className="mt-8 gap-2">
            {ROWS.map((row) => (
              <Pressable
                key={row.label}
                className="flex-row items-center gap-4 rounded-2xl border border-white/10 bg-surface-card px-5 py-4 active:opacity-70">
                <SymbolView
                  tintColor="#D1D5DB"
                  name={{ ios: row.icon, android: row.android, web: row.android }}
                  size={18}
                />
                <Text className="flex-1 font-poppins-medium text-base text-white">
                  {row.label}
                </Text>
                <SymbolView
                  tintColor="#6B7280"
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                  size={14}
                />
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleLogout}
            className="mt-8 items-center rounded-full border border-white/10 py-4 active:opacity-70">
            <Text className="font-poppins-semibold text-base text-accent-coral">Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
