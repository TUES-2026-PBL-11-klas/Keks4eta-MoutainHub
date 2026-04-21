import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Radii, Space } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ErrorBannerProps = {
  message: string;
};

export function ErrorBanner({ message }: ErrorBannerProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: palette.danger + '18',
          borderColor: palette.danger + '55',
        },
      ]}
      accessibilityRole="alert"
    >
      <Ionicons name="alert-circle-outline" size={18} color={palette.danger} />
      <Text style={[styles.text, { color: palette.danger, fontFamily: Fonts.sans }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    paddingVertical: Space.sm,
    paddingHorizontal: Space.md,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  text: { fontSize: FontSize.sm, fontWeight: '500', flexShrink: 1 },
});
