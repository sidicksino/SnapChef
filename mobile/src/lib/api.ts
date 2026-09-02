import { API_BASE_URL, apiClient } from '@/lib/api-client';

// Types mirror backend/schemas.py exactly — see that file, not this comment,
// as the source of truth if they ever drift.

export type Token = { access_token: string; token_type: string };

export type UserOut = {
  id: number;
  email: string;
  dietary_preferences: string[];
  created_at: string;
};

export type RecipeIngredient = { name: string; amount: string };

export type RecipeOut = {
  id: number;
  title: string;
  description: string;
  instructions: string[];
  prep_time_minutes: number;
  cook_time_minutes: number;
  ingredients: RecipeIngredient[];
  image_url?: string | null;
  created_at: string;
};

/** The LLM's raw output shape from POST /api/recipes/generate — notably
 * different from RecipeOut/RecipeCreate (a single estimated_time instead of
 * prep/cook split, and ingredients as plain description strings instead of
 * {name, amount} pairs). See `mapGeneratedRecipeToCreatePayload` below for
 * how saving reconciles the mismatch. */
export type RecipeResponse = {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  estimated_time: number;
  nutritional_info?: string | null;
  image_url?: string | null;
};

export type RecipeCreatePayload = {
  title: string;
  description: string;
  instructions: string[];
  prep_time_minutes: number;
  cook_time_minutes: number;
  ingredients: RecipeIngredient[];
  image_url?: string | null;
};

/** Recipe images are served from the backend's own /static route as a
 * relative path (e.g. "/static/recipe_images/xyz.png") — resolve it
 * against whatever host the app is already talking to for the API, same
 * as every other request, rather than hardcoding a host. */
export function resolveRecipeImageUrl(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined;
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
}

export const authApi = {
  register: (email: string, password: string) =>
    apiClient.post<Token>('/api/auth/register', { email, password }),

  // /api/auth/login is OAuth2PasswordRequestForm on the backend, not JSON —
  // it expects form-encoded `username`/`password` fields (the OAuth2 spec's
  // field name for what is, here, an email).
  login: (email: string, password: string) =>
    apiClient.post<Token>(
      '/api/auth/login',
      `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ),
};

export const usersApi = {
  me: () => apiClient.get<UserOut>('/api/users/me'),
  updateMe: (dietary_preferences: string[]) =>
    apiClient.put<UserOut>('/api/users/me', { dietary_preferences }),
};

export const recipesApi = {
  list: () => apiClient.get<RecipeOut[]>('/api/recipes'),
  // Longer timeout than the client default (15s) — this now does a text
  // generation call *and* an image generation call server-side, which can
  // together take longer than that, especially on a slower connection.
  generate: (ingredients: string[]) =>
    apiClient.post<RecipeResponse>(
      '/api/recipes/generate',
      { ingredients },
      { timeout: 60000 }
    ),
  save: (payload: RecipeCreatePayload) => apiClient.post<RecipeOut>('/api/recipes', payload),
};

// The generate endpoint's response doesn't line up with what save expects
// (see RecipeResponse's comment above) — this is a real shape mismatch in
// the backend's own schemas, not something to silently paper over. Splits
// estimated_time into a rough prep/cook allocation and carries each
// ingredient description string through as-is (no separate amount field is
// available to split out).
export function mapGeneratedRecipeToCreatePayload(recipe: RecipeResponse): RecipeCreatePayload {
  const prep = Math.min(10, Math.round(recipe.estimated_time / 3));
  return {
    title: recipe.title,
    description: recipe.description,
    instructions: recipe.instructions,
    prep_time_minutes: prep,
    cook_time_minutes: Math.max(recipe.estimated_time - prep, 0),
    ingredients: recipe.ingredients.map((name) => ({ name, amount: '' })),
    image_url: recipe.image_url,
  };
}
