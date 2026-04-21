import React from 'react';
import { Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radii, Shadow, Space } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CardProps = {
  children: React.ReactNode;
  padded?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  elevated?: boolean;
  borderless?: boolean;
};

export function Card({
  children,
  padded = true,
  onPress,
  style,
  elevated = true,
  borderless,
}: CardProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  const base: ViewStyle = {
    backgroundColor: palette.surface,
    borderRadius: Radii.lg,
    borderWidth: borderless ? 0 : 1,
    borderColor: palette.border,
    padding: padded ? Space.lg : 0,
    ...(elevated ? Shadow.card : null),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed, hovered }: any) => [
          base,
          {
            opacity: pressed ? 0.92 : 1,
            transform: hovered ? [{ translateY: -1 }] : undefined,
            ...(Platform.OS === 'web' ? { cursor: 'pointer' as any, transition: 'transform 120ms ease' as any } : null),
          },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[base, style]}>{children}</View>;
}

const styles = StyleSheet.create({});
