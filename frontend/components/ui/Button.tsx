import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, FontSize, Radii, Space, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  accessibilityLabel?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  leading,
  trailing,
  style,
  labelStyle,
  accessibilityLabel,
}: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const isDisabled = disabled || loading;

  const paddings: Record<ButtonSize, { v: number; h: number; font: number; radius: number }> = {
    sm: { v: Space.xs + 2, h: Space.md, font: FontSize.sm, radius: Radii.sm },
    md: { v: Space.sm + 2, h: Space.lg, font: FontSize.md, radius: Radii.md },
    lg: { v: Space.md, h: Space.xl, font: FontSize.lg, radius: Radii.md },
  };
  const p = paddings[size];

  const variantStyles: Record<
    ButtonVariant,
    { bg: string; border: string; color: string }
  > = {
    primary: { bg: palette.primary, border: palette.primary, color: palette.primaryText },
    secondary: { bg: 'transparent', border: palette.primary, color: palette.primary },
    ghost: { bg: 'transparent', border: 'transparent', color: palette.primary },
    danger: { bg: palette.danger, border: palette.danger, color: '#FFFFFF' },
    accent: { bg: palette.accent, border: palette.accent, color: '#07240F' },
  };
  const v = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={({ pressed, hovered }: any) => [
        styles.base,
        {
          paddingVertical: p.v,
          paddingHorizontal: p.h,
          borderRadius: p.radius,
          backgroundColor: v.bg,
          borderColor: v.border,
          width: fullWidth ? '100%' : undefined,
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : hovered ? 0.92 : 1,
          transform: pressed ? [{ scale: 0.98 }] : undefined,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={v.color} style={styles.leading} />
        ) : leading ? (
          <View style={styles.leading}>{leading}</View>
        ) : null}
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: v.color,
              fontSize: p.font,
              fontFamily: Fonts.sans,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', userSelect: 'none' as any } : {}),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
  },
  label: { fontWeight: '600', letterSpacing: 0.2 },
  leading: { marginRight: 0 },
  trailing: { marginLeft: 0 },
});
