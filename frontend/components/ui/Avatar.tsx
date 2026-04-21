import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Fonts, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AvatarProps = {
  uri?: string | null;
  name?: string | null;
  size?: number;
  onPress?: () => void;
  ring?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

function initialsFrom(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function Avatar({
  uri,
  name,
  size = 40,
  onPress,
  ring,
  accessibilityLabel,
  style,
}: AvatarProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  const radius = Radii.pill;
  const fontSize = Math.round(size * 0.4);

  const circle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    overflow: 'hidden',
    borderWidth: ring ? 2 : 0,
    borderColor: palette.background,
  };

  const content = uri ? (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: radius }}
      accessibilityIgnoresInvertColors
    />
  ) : (
    <Text style={[styles.initials, { color: palette.primaryText, fontSize, fontFamily: Fonts.sans }]}>
      {initialsFrom(name)}
    </Text>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? 'Profile'}
        hitSlop={8}
        style={({ pressed, hovered }: any) => [
          circle,
          {
            opacity: pressed ? 0.85 : 1,
            transform: hovered ? [{ scale: 1.03 }] : undefined,
            ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
          },
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[circle, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  initials: { fontWeight: '700', letterSpacing: 0.4 },
});
