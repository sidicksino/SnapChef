import { SymbolView } from 'expo-symbols';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastKind = 'error' | 'success';
type ToastState = { id: number; message: string; kind: ToastKind } | null;

const ToastContext = createContext<((message: string, kind?: ToastKind) => void) | null>(null);

// The in-app toast every big app (Instagram, Spotify, TikTok) uses for
// transient/background-operation feedback instead of a native OS alert
// dialog — see mobile/src/components/form-error.tsx for the *inline* form
// counterpart (used for login/signup, where the error belongs right next
// to the field that caused it, not floating above the whole screen).
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const insets = useSafeAreaInsets();
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, kind: ToastKind = 'error') => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    const id = Date.now();
    setToast({ id, message, kind });
    dismissTimer.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <Animated.View
          key={toast.id}
          entering={FadeInUp.duration(200)}
          exiting={FadeOutUp.duration(150)}
          pointerEvents="box-none"
          className="absolute inset-x-4 z-50"
          style={{ top: insets.top + 8 }}>
          <Pressable
            onPress={() => setToast(null)}
            className={`flex-row items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg ${
              toast.kind === 'error'
                ? 'border-accent-coral/30 bg-surface-card'
                : 'border-brand-green/30 bg-surface-card'
            }`}>
            <SymbolView
              tintColor={toast.kind === 'error' ? '#FB7185' : '#22C55E'}
              name={{
                ios: toast.kind === 'error' ? 'exclamationmark.circle.fill' : 'checkmark.circle.fill',
                android: toast.kind === 'error' ? 'error' : 'check_circle',
                web: toast.kind === 'error' ? 'error' : 'check_circle',
              }}
              size={20}
            />
            <Text className="flex-1 font-poppins-medium text-sm text-white">{toast.message}</Text>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
