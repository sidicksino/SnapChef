import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';

import { ScanTabButton, TabBarContainer, TabBarIcon } from '@/components/tab-bar';

// Web-only: there's no system tab bar on the web, so this uses expo-router/ui's
// headless Tabs to render the same custom pill + floating Scan FAB as the
// design system. Native (iOS/Android) uses the real NativeTabs in _layout.tsx.
export default function TabsLayoutWeb() {
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <TabBarContainer>
          <TabTrigger name="home" href="/home" asChild>
            <TabBarIcon icon="home" label="Home" />
          </TabTrigger>
          <TabTrigger name="search" href="/search" asChild>
            <TabBarIcon icon="search" label="Search" />
          </TabTrigger>
          <TabTrigger name="scan" href="/scan" asChild>
            <ScanTabButton />
          </TabTrigger>
          <TabTrigger name="saved" href="/saved" asChild>
            <TabBarIcon icon="saved" label="Saved" />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabBarIcon icon="profile" label="Profile" />
          </TabTrigger>
        </TabBarContainer>
      </TabList>
    </Tabs>
  );
}
