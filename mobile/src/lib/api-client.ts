import { create as createAxios, isAxiosError } from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import { tokenStorage } from '@/lib/token-storage';

// Resolves the backend's base URL without hardcoding a machine-specific IP:
// - EXPO_PUBLIC_API_URL overrides everything, for pointing at a deployed backend.
// - Web: the backend is assumed to be on the same host as the page.
// - Native (simulator or a real device on the same network): reuse the host
//   Metro is already running on (`Constants.expoConfig.hostUri`, e.g.
//   "192.168.1.81:8081") and swap in the backend's port. This is the same
//   trick Expo's dev-client itself uses to find the packager.
function resolveApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  if (Platform.OS === 'web') return 'http://localhost:8000';

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  return host ? `http://${host}:8000` : 'http://localhost:8000';
}

export const API_BASE_URL = resolveApiUrl();

export const apiClient = createAxios({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Attach the stored JWT to every request, read fresh each time (not cached
// in a module variable) so a login/logout in another part of the app is
// always reflected immediately.
apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 on a request that carried a token means that token is expired/
// invalid — clear it and bounce back to login rather than leaving the user
// stuck on a screen that silently fails to load its data.
//
// Critical: only do this when the request actually had a token attached.
// /api/auth/login itself returns a completely normal, expected 401 for
// wrong credentials — that request never carries a token. Redirecting on
// *every* 401 here caused a real bug: replacing '/login' with '/login'
// while already on that screen still remounts it, wiping the inline error
// (and the typed email/password) a moment after showing it.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const hadToken = !!error.config?.headers?.Authorization;
    if (error.response?.status === 401 && hadToken) {
      await tokenStorage.remove();
      router.replace('/login');
    }
    return Promise.reject(error);
  }
);

/** Pulls FastAPI's `{"detail": "..."}` error shape into a plain message. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    // A timeout still reached the server (or never got a response in time)
    // — distinct from truly being unreachable, and worth saying so, since
    // "check your connection" is misleading when the connection was fine.
    if (error.code === 'ECONNABORTED') return 'That took too long — please try again.';
    if (!error.response) return 'Could not reach the server. Check your connection.';
  }
  return fallback;
}
