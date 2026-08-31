import * as SecureStore from 'expo-secure-store';

const KEY = 'snapchef_auth_token';

// Native implementation — expo-secure-store's real (Keychain/Keystore-backed)
// storage. See token-storage.web.ts for why web needs a separate file.
export const tokenStorage = {
  get: () => SecureStore.getItemAsync(KEY),
  set: (token: string) => SecureStore.setItemAsync(KEY, token),
  remove: () => SecureStore.deleteItemAsync(KEY),
};
