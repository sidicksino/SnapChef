const KEY = 'snapchef_auth_token';

// expo-secure-store's web build is a literal empty stub (`export default {}`)
// — none of its methods exist on web at all, they'd throw if called. Fall
// back to localStorage here, wrapped defensively since it can throw in some
// contexts (private browsing, blocked site data).
export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  async set(token: string): Promise<void> {
    try {
      localStorage.setItem(KEY, token);
    } catch {
      // no-op — best effort on web
    }
  },
  async remove(): Promise<void> {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // no-op
    }
  },
};
