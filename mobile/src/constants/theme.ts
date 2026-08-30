/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * The SnapChef brand system (see mobile/assets/images/design-system.png).
 * This is the source of truth for hex values; `tailwind.config.js` mirrors
 * this same palette for NativeWind screens — keep both in sync.
 */
export const Brand = {
  background: { primary: '#0B1220', secondary: '#111827' },
  surface: { elevated: '#1F2937', card: '#1E293B' },
  primary: { green: '#22C55E', leaf: '#16A34A', dark: '#0F172A', white: '#FFFFFF' },
  secondary: { blue: '#3B82F6', amber: '#F59E0B', coral: '#FB7185', purple: '#B85CF6' },
  gray: {
    900: '#0B1220',
    800: '#111827',
    700: '#1F2937',
    600: '#374151',
    400: '#9CA3AF',
    300: '#D1D5DB',
    200: '#E5E7EB',
    100: '#F3F4F6',
  },
  gradients: {
    green: ['#22C55E', '#16A34A'],
    fresh: ['#3B82F6', '#22C55E'],
    warm: ['#F59E0B', '#FB7185'],
  },
} as const;

/** The Poppins type ramp from the design system: [fontSize, lineHeight, letterSpacing]. */
export const Type = {
  h1: { fontSize: 32, lineHeight: 38, letterSpacing: -0.5, fontFamily: 'Poppins_700Bold' },
  h2: { fontSize: 24, lineHeight: 30, letterSpacing: -0.25, fontFamily: 'Poppins_600SemiBold' },
  h3: { fontSize: 20, lineHeight: 26, letterSpacing: 0, fontFamily: 'Poppins_600SemiBold' },
  body1: { fontSize: 16, lineHeight: 24, letterSpacing: 0, fontFamily: 'Poppins_400Regular' },
  body2: { fontSize: 14, lineHeight: 20, letterSpacing: 0, fontFamily: 'Poppins_400Regular' },
  caption: { fontSize: 12, lineHeight: 16, letterSpacing: 0, fontFamily: 'Poppins_400Regular' },
} as const;

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: Brand.background.primary,
    backgroundElement: Brand.surface.elevated,
    backgroundSelected: Brand.surface.card,
    textSecondary: Brand.gray[400],
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
