import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authApi, usersApi, type UserOut } from '@/lib/api';
import { tokenStorage } from '@/lib/token-storage';

type AuthContextValue = {
  /** undefined = still hydrating from storage, null = signed out. */
  user: UserOut | null | undefined;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Local optimistic update after PUT /api/users/me, so callers don't need
   * to refetch just to reflect a change they just made themselves. */
  setUser: (user: UserOut) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null | undefined>(undefined);

  const refreshUser = useCallback(async () => {
    const token = await tokenStorage.get();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { data } = await usersApi.me();
      setUser(data);
    } catch {
      // Token was present but rejected (expired/invalid) — the api-client's
      // response interceptor already clears it and redirects on a real 401;
      // this just makes sure local state agrees.
      setUser(null);
    }
  }, []);

  // Hydrate on app boot. Known false positive on async useCallback fns
  // (setState is after an await, not synchronous):
  // https://github.com/facebook/react/issues/34905
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    await tokenStorage.set(data.access_token);
    await refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.register(email, password);
    await tokenStorage.set(data.access_token);
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await tokenStorage.remove();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [user, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
