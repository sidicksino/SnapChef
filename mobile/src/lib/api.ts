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

  // The backend's forgot-password is an explicit `# MOCK EMAIL SENDER` —
  // it prints the reset link to the *backend's own terminal* instead of
  // actually sending an email (no email service is configured). Real,
  // working request/response either way — just no delivery yet.
  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, new_password: string) =>
    apiClient.post<{ message: string }>('/api/auth/reset-password', { token, new_password }),
  changePassword: (current_password: string, new_password: string) =>
    apiClient.post<{ message: string }>('/api/auth/change-password', {
      current_password,
      new_password,
    }),
};

export const usersApi = {
  me: () => apiClient.get<UserOut>('/api/users/me'),
  updateMe: (dietary_preferences: string[]) =>
    apiClient.put<UserOut>('/api/users/me', { dietary_preferences }),
};

// Builds multipart form data for an image upload from a local photo URI.
// Native (`file://...`) URIs use React Native's special {uri, name, type}
// FormData shape; web's picker can hand back a `data:`/`blob:` URI instead,
// which that shape doesn't work for — fetch it and append a real Blob.
async function buildImageFormData(uri: string): Promise<FormData> {
  const formData = new FormData();
  if (uri.startsWith('file://')) {
    // @ts-expect-error — React Native's FormData accepts this file-object
    // shape; the DOM lib's FormData.append types don't know about it.
    formData.append('image', { uri, name: 'photo.jpg', type: 'image/jpeg' });
  } else {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('image', blob, 'photo.jpg');
  }
  return formData;
}

export const recipesApi = {
  list: () => apiClient.get<RecipeOut[]>('/api/recipes'),
  get: (id: number) => apiClient.get<RecipeOut>(`/api/recipes/${id}`),
  detectIngredients: async (uri: string) => {
    const formData = await buildImageFormData(uri);
    return apiClient.post<{ ingredients: string[] }>('/api/recipes/detect-ingredients', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
  },
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
  delete: (id: number) => apiClient.delete<void>(`/api/recipes/${id}`),
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
