import type { AndroidSymbol } from 'expo-symbols';
import type { SFSymbols7_0 } from 'sf-symbols-typescript';

import { Brand } from '@/constants/theme';

// The backend's RecipeOut (backend/schemas.py) has no color/icon/difficulty
// field at all — those are purely a mobile-side presentation concern. This
// picks a stable (not random-per-render) gradient + watermark icon from a
// fixed palette keyed off the recipe's id, and derives a difficulty label
// from its time, so every real recipe still renders using the same
// RecipeCard visual language as the sample data did.
const PALETTE: { gradient: readonly [string, string]; icon: SFSymbols7_0; iconAndroid: AndroidSymbol }[] = [
  { gradient: Brand.gradients.green, icon: 'fork.knife', iconAndroid: 'restaurant' },
  { gradient: Brand.gradients.warm, icon: 'flame', iconAndroid: 'local_fire_department' },
  { gradient: Brand.gradients.fresh, icon: 'leaf', iconAndroid: 'eco' },
  { gradient: ['#FB7185', '#B85CF6'], icon: 'fish', iconAndroid: 'set_meal' },
  { gradient: ['#3B82F6', '#B85CF6'], icon: 'carrot', iconAndroid: 'nutrition' },
  { gradient: ['#F59E0B', '#22C55E'], icon: 'bird', iconAndroid: 'egg_alt' },
];

export function getRecipePresentation(recipeId: number) {
  return PALETTE[recipeId % PALETTE.length];
}

export function getDifficulty(prepMinutes: number, cookMinutes: number): 'Easy' | 'Medium' | 'Hard' {
  const total = prepMinutes + cookMinutes;
  if (total <= 20) return 'Easy';
  if (total <= 40) return 'Medium';
  return 'Hard';
}
