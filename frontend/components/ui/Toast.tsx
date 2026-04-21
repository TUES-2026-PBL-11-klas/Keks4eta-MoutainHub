import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Radii, Shadow, Space } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ToastKind = 'success' | 'error' | 'info';
type Toast = { id: number; kind: ToastKind; message: string };

type Ctx = {
  show: (message: string, kind?: ToastKind) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function useToast(): Ctx {
  const c = useContext(ToastCtx);
  if (!c) throw new Error('useToast must be used within <ToastProvider>');
  return c;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const ctx: Ctx = {
    show,
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
    info: (msg) => show(msg, 'info'),
  };

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <View pointerEvents="box-none" style={styles.host}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </View>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const translate = React.useRef(new Animated.Value(20)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translate, { toValue: 0, useNativeDriver: true, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [translate, opacity]);

  const kindColor =
    toast.kind === 'success'
      ? palette.accent
      : toast.kind === 'error'
      ? palette.danger
      : palette.primary;

  const iconName =
    toast.kind === 'success'
      ? 'checkmark-circle'
      : toast.kind === 'error'
      ? 'alert-circle'
      : 'information-circle';

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          transform: [{ translateY: translate }],
          opacity,
        },
        Shadow.floating,
      ]}
    >
      <View style={[styles.stripe, { backgroundColor: kindColor }]} />
      <Ionicons name={iconName as any} size={20} color={kindColor} />
      <Text style={[styles.msg, { color: palette.text, fontFamily: Fonts.sans }]}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'web' ? 24 : 48,
    alignItems: 'center',
    gap: Space.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    paddingVertical: Space.sm + 2,
    paddingHorizontal: Space.md,
    paddingLeft: Space.md + 4,
    borderRadius: Radii.md,
    borderWidth: 1,
    maxWidth: 420,
    minWidth: 260,
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  msg: { fontSize: FontSize.sm, fontWeight: '500', flexShrink: 1 },
});
